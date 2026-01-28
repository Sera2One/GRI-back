// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Chroma } from '@langchain/chroma';
import { OpenAIEmbeddings } from '@langchain/openai';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { ChatOpenAI } from '@langchain/openai';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Chemins
const DOCUMENTS_DIR = './documents';
const PERSIST_DIR = './vector-store';
const COLLECTION_NAME = 'armp_docs';

let vectorStore = null;

// Vérifie que le dossier documents existe
if (!fs.existsSync(DOCUMENTS_DIR)) {
	fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
	console.log(`📁 Dossier ${DOCUMENTS_DIR} créé. Ajoute tes PDF/DOCX dedans.`);
}

// Initialisation de Chroma en local (persisté sur disque)
async function initVectorStore() {
	console.log('🔍 Analyse des documents...');

	// Charger tous les documents
	const docs = [];
	if (fs.existsSync(DOCUMENTS_DIR)) {
		const files = fs.readdirSync(DOCUMENTS_DIR);
		for (const file of files) {
			const fullPath = path.join(DOCUMENTS_DIR, file);
			try {
				if (file.endsWith('.pdf')) {
					const loader = new PDFLoader(fullPath);
					docs.push(...(await loader.load()));
				} else if (file.endsWith('.docx')) {
					const loader = new DocxLoader(fullPath);
					docs.push(...(await loader.load()));
				}
			} catch (err) {
				console.warn(`⚠️ Impossible de lire ${file}:`, err.message);
			}
		}
	}

	if (docs.length === 0) {
		console.warn(
			'❗ Aucun document trouvé. Place des .pdf ou .docx dans ./documents',
		);
		return null;
	}

	// Découpage
	const splitter = new CharacterTextSplitter({
		chunkSize: 500,
		chunkOverlap: 50,
	});
	const splitDocs = await splitter.splitDocuments(docs);

	// Embeddings via OpenRouter (gratuit, compatible OpenAI)
	const embeddings = new OpenAIEmbeddings({
		openAIApiKey: process.env.OPENROUTER_API_KEY,
		configuration: {
			baseURL: 'https://openrouter.ai/api/v1',
		},
	});

	// Création ou chargement de la base vectorielle locale
	vectorStore = await Chroma.fromDocuments(splitDocs, embeddings, {
		collectionName: COLLECTION_NAME,
		persistDirectory: PERSIST_DIR, // ← Persistance locale
	});

	// Sauvegarde explicite (important pour la persistance)
	await vectorStore.persist();

	console.log(
		`✅ ${splitDocs.length} chunks indexés et sauvegardés dans ${PERSIST_DIR}`,
	);
	return vectorStore;
}

// Route /ask
app.post('/ask', async (req, res) => {
	const { question } = req.body;
	if (!question?.trim()) {
		return res.status(400).json({ error: 'Question manquante' });
	}

	if (!vectorStore) {
		return res.status(503).json({ error: 'Base de connaissances non chargée' });
	}

	try {
		// Recherche sémantique
		const relevantDocs = await vectorStore.similaritySearch(question, 3);
		const context = relevantDocs.map(d => d.pageContent).join('\n---\n');

		// Génération avec DeepSeek via OpenRouter
		const chat = new ChatOpenAI({
			openAIApiKey: process.env.OPENROUTER_API_KEY,
			configuration: {
				baseURL: 'https://openrouter.ai/api/v1',
			},
			model: 'deepseek/deepseek-r1-distill-llama-70b:free',
			temperature: 0.2,
			maxTokens: 400,
		});

		const prompt = `Tu es l'assistant officiel de la Plateforme d'échange ARMP.
Réponds uniquement avec les informations ci-dessous. Si la réponse n'est pas dans les documents, dis : "Je ne sais pas."

Documents :
---
${context}
---

Question : ${question}

Réponse :`;

		const result = await chat.invoke([{ role: 'user', content: prompt }]);
		res.json({ answer: result.content.trim() });
	} catch (error) {
		console.error('❌ Erreur RAG :', error.message);
		res.status(500).json({ error: 'Échec de génération' });
	}
});

// Route de santé (optionnel)
app.get('/health', (req, res) => {
	res.json({ status: 'ok', vectorStoreReady: !!vectorStore });
});

// Démarrage
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
	console.log(`🚀 Serveur RAG local démarré sur http://localhost:${PORT}`);
	console.log('⏳ Chargement de la base de connaissances...');
	await initVectorStore();
	console.log('✅ Prêt à répondre aux questions !');
});

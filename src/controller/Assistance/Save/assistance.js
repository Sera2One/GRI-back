// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { OpenAIEmbeddings } from '@langchain/openai';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { ChatOpenAI } from '@langchain/openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- Configuration ---
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const DOCUMENTS_DIR = './documents';
const CHROMA_DIR = './vector-store';

let vectorStore = null;

// --- Fonction pour charger et indexer les documents ---
async function initVectorStore() {
	console.log('🔍 Chargement des documents...');

	const docs = [];

	// Charger tous les PDF
	const fs = require('fs').promises;
	const path = require('path');
	const files = await fs.readdir(DOCUMENTS_DIR);

	for (const file of files) {
		const fullPath = path.join(DOCUMENTS_DIR, file);
		if (file.endsWith('.pdf')) {
			const loader = new PDFLoader(fullPath);
			docs.push(...(await loader.load()));
		} else if (file.endsWith('.docx')) {
			const loader = new DocxLoader(fullPath);
			docs.push(...(await loader.load()));
		}
	}

	if (docs.length === 0) {
		console.warn('⚠️ Aucun document trouvé dans ./documents');
		return null;
	}

	// Découper en chunks
	const splitter = new CharacterTextSplitter({
		chunkSize: 500,
		chunkOverlap: 50,
	});
	const splitDocs = await splitter.splitDocuments(docs);

	// Créer les embeddings (via OpenAI embeddings gratuits via OpenRouter)
	const embeddings = new OpenAIEmbeddings({
		openAIApiKey: OPENROUTER_API_KEY,
		configuration: {
			baseURL: 'https://openrouter.ai/api/v1',
		},
	});

	// Sauvegarder dans Chroma (persisté sur disque)
	vectorStore = await Chroma.fromDocuments(splitDocs, embeddings, {
		collectionName: 'armp_docs',
		url: 'http://localhost:8000', // optionnel si tu lances Chroma en serveur
		// Sinon, utilise le mode in-memory + persistance via chemin (voir note ci-dessous)
	});

	console.log(`✅ ${splitDocs.length} chunks indexés.`);
	return vectorStore;
}

// --- Route principale : /ask ---
app.post('/ask', async (req, res) => {
	const { question } = req.body;
	if (!question) {
		return res.status(400).json({ error: 'Question manquante' });
	}

	try {
		if (!vectorStore) {
			return res.status(503).json({ error: 'Base de connaissances non prête' });
		}

		// Recherche sémantique
		const relevantDocs = await vectorStore.similaritySearch(question, 3);
		const context = relevantDocs.map(d => d.pageContent).join('\n---\n');

		// Appel à DeepSeek via OpenRouter
		const chat = new ChatOpenAI({
			openAIApiKey: OPENROUTER_API_KEY,
			configuration: {
				baseURL: 'https://openrouter.ai/api/v1',
			},
			model: 'deepseek/deepseek-r1-distill-llama-70b:free',
			temperature: 0.3,
			maxTokens: 300,
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
		res.json({ answer: result.content });
	} catch (error) {
		console.error('❌ Erreur :', error.message);
		res.status(500).json({ error: 'Échec du traitement' });
	}
});

// --- Démarrage ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
	console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
	await initVectorStore();
});

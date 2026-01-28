// assistanceService.js
import { pipeline } from '@xenova/transformers';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { CharacterTextSplitter } from '@langchain/textsplitters';
import { OpenAI } from 'openai';
import { OpenRouter } from '@openrouter/sdk';
import fs from 'fs';
import path from 'path';

const publicFolder = process.env.APP_PUBLIC_FOLDER;
const DOCUMENTS_DIR = path.join(publicFolder, 'Post/documents');
const CACHE_FILE = path.join(publicFolder, 'Post/vector-store.json');

let knowledgeBase = null; // { chunks: [...], embeddings: [...] }

// Calcul de similarité cosinus
function cosineSimilarity(a, b) {
	const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
	const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
	const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
	return dot / (normA * normB);
}

// Charger ou construire la base
export async function initVectorStore() {
	if (!fs.existsSync(DOCUMENTS_DIR)) {
		fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
		console.log(`📁 Dossier ${DOCUMENTS_DIR} créé.`);
	}

	console.log('🔍 Parsing des documents...');
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
				console.warn(`⚠️ Erreur lecture ${file}:`, err.message);
			}
		}
	}

	if (docs.length === 0) {
		console.warn('❗ Aucun document trouvé.');
		return;
	}

	const splitter = new CharacterTextSplitter({
		chunkSize: 500,
		chunkOverlap: 50,
	});
	const chunks = await splitter.splitDocuments(docs);
	const texts = chunks.map(d => d.pageContent);

	console.log(
		'🧠 Génération des embeddings (100 % local, peut prendre 30s la 1ère fois)...',
	);

	// Modèle d'embedding local (SentenceTransformer en JS)
	const embedder = await pipeline(
		'feature-extraction',
		'Xenova/all-MiniLM-L6-v2',
	);

	const embeddings = [];
	for (const text of texts) {
		const output = await embedder(text, { pooling: 'mean', normalize: true });
		embeddings.push(Array.from(output.data));
	}

	knowledgeBase = { chunks: texts, embeddings };

	// Sauvegarder dans un fichier (persistance)
	fs.writeFileSync(
		CACHE_FILE,
		JSON.stringify({ chunks: texts, embeddings }, null, 2),
	);
	console.log(`✅ ${texts.length} chunks sauvegardés dans ${CACHE_FILE}`);
}

// Charger depuis cache au démarrage (si existant)
export function loadFromCache() {
	if (fs.existsSync(CACHE_FILE)) {
		console.log('📂 Chargement de la base depuis le cache...');
		const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
		knowledgeBase = data;
		console.log(`✅ ${data.chunks.length} chunks chargés.`);
	}
}

export function isVectorStoreReady() {
	return knowledgeBase !== null;
}

// Recherche sémantique locale
export async function askAssistance(question) {
	if (!knowledgeBase) throw new Error('Base non prête');

	// Embedding de la question
	const embedder = await pipeline(
		'feature-extraction',
		'Xenova/all-MiniLM-L6-v2',
	);
	const questionEmbedding = Array.from(
		(await embedder(question, { pooling: 'mean', normalize: true })).data,
	);

	// Calcul des similarités
	const scores = knowledgeBase.embeddings
		.map((emb, i) => ({
			score: cosineSimilarity(questionEmbedding, emb),
			index: i,
		}))
		.sort((a, b) => b.score - a.score)
		.slice(0, 3);

	const context = scores
		.map(s => knowledgeBase.chunks[s.index])
		.join('\n---\n');


  console.log('result', scores);
	console.log('context', context);

	// Génération via OpenRouter
	/* const openai = new OpenAI({
		apiKey: process.env.OPENROUTER_API_KEY,
		baseURL: 'https://openrouter.ai/api/v1',
	}); */

	//apiKey: process.env.OPENROUTER_API_KEY,
  const openRouter = new OpenRouter({
		apiKey:
			'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',
	});

	const prompt = `Tu es l'assistant officiel de la Plateforme d'échange ARMP.
Réponds uniquement avec les informations ci-dessous. Si la réponse n'est pas dans les documents, dis : "Je ne sais pas."

Documents :
---
${context}
---

Question : ${question}

Réponse :`;

	/* const chatCompletion = await openai.chat.completions.create({
		model: 'deepseek/deepseek-r1-distill-llama-70b:free',
		messages: [{ role: 'user', content: prompt }],
		temperature: 0.2,
		max_tokens: 400,
	}); */

  console.log('process.env.OPENROUTER_API_KEY', process.env.OPENROUTER_API_KEY);
  

  const chatCompletion = await openRouter.chat.send({
		model: 'qwen/qwen3-coder:free',

		messages: [
			{
				role: 'user',

				content: prompt,
			},
		],

		stream: false,
	});
				//prompt,

  console.log('chatCompletion', chatCompletion);
  

	return chatCompletion.choices[0].message.content.trim();
}

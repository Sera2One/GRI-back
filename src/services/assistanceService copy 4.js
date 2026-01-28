// assistanceService.js
import { pipeline } from '@xenova/transformers';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import fs from 'fs';
import path from 'path';

const publicFolder = process.env.APP_PUBLIC_FOLDER;
const DOCUMENTS_DIR = path.join(publicFolder, 'Post/documents');
const CACHE_FILE = path.join(publicFolder, 'Post/vector-store.json');

let knowledgeBase = null; // { chunks: string[], embeddings: number[][] }

// Cosine similarity
function cosineSimilarity(a, b) {
	const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
	const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
	const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
	return normA === 0 || normB === 0 ? 0 : dot / (normA * normB);
}

// Amélioration du chunking pour les textes juridiques
async function splitLegalDocument(rawText) {
	// Divise par "Article X." en conservant le délimiteur
	const lines = rawText.split('\n');
	const articles = [];
	let currentArticle = '';

	for (const line of lines) {
		// Détecte les titres d'articles (ex: "Article 45.- ...")
		if (/^Article \d+\.?-?/.test(line.trim())) {
			if (currentArticle) articles.push(currentArticle.trim());
			currentArticle = line + '\n';
		} else {
			currentArticle += line + '\n';
		}
	}
	if (currentArticle) articles.push(currentArticle.trim());

	return articles.length > 1 ? articles : [rawText]; // fallback
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
					const loaded = await loader.load();
					for (const doc of loaded) {
						const chunks = await splitLegalDocument(doc.pageContent);
						docs.push(...chunks);
					}
				} else if (file.endsWith('.docx')) {
					const loader = new DocxLoader(fullPath);
					const loaded = await loader.load();
					for (const doc of loaded) {
						const chunks = await splitLegalDocument(doc.pageContent);
						docs.push(...chunks);
					}
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

	console.log(`📄 ${docs.length} articles/chunks extraits.`);

	// Charger le modèle multilingue (meilleur pour le français)
	console.log(
		"🧠 Chargement de 'multilingual-e5-large' (1ère fois : ~500 Mo)...",
	);
	const embedder = await pipeline(
		'feature-extraction',
		'Xenova/multilingual-e5-large',
	);

	const embeddings = [];
	for (let i = 0; i < docs.length; i++) {
		if (i % 10 === 0) console.log(`  → Embedding ${i + 1}/${docs.length}`);
		// Préfixe recommandé par les auteurs de E5
		const input = 'query: ' + docs[i]; // ou "passage: " pour les documents — ici on garde simple
		const output = await embedder(input, { pooling: 'mean', normalize: true });
		embeddings.push(Array.from(output.data));
	}

	knowledgeBase = { chunks: docs, embeddings };
	fs.writeFileSync(
		CACHE_FILE,
		JSON.stringify({ chunks: docs, embeddings }, null, 2),
	);
	console.log(`✅ Base sauvegardée dans ${CACHE_FILE}`);
}

// Charger depuis cache au démarrage
export function loadFromCache() {
	if (fs.existsSync(CACHE_FILE)) {
		console.log('📂 Chargement depuis le cache...');
		const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
		knowledgeBase = data;
		console.log(`✅ ${data.chunks.length} chunks chargés.`);
	}
}

export function isVectorStoreReady() {
	return knowledgeBase !== null;
}

// Recherche hybride : sémantique + mot-clé (Article X)
export async function askAssistance(question) {
	if (!knowledgeBase) throw new Error('Base non prête');

	// 1. Recherche exacte par Article (ex: "Article 45")
	let context = '';
	const articleMatch = question.match(/Article\s+(\d+)/i);
	if (articleMatch) {
		const articleNum = articleMatch[1];
		const exactChunk = knowledgeBase.chunks.find(chunk =>
			new RegExp(`Article\\s+${articleNum}\\.?-?`, 'i').test(chunk),
		);
		if (exactChunk) {
			context = exactChunk;
			console.log(`🎯 Article ${articleNum} trouvé par correspondance exacte.`);
		}
	}

	// 2. Si pas trouvé, faire une recherche sémantique
	if (!context) {
		const embedder = await pipeline(
			'feature-extraction',
			'Xenova/multilingual-e5-large',
		);
		const questionEmbedding = Array.from(
			(
				await embedder('query: ' + question, {
					pooling: 'mean',
					normalize: true,
				})
			).data,
		);

		const scores = knowledgeBase.embeddings
			.map((emb, i) => ({
				score: cosineSimilarity(questionEmbedding, emb),
				index: i,
			}))
			.sort((a, b) => b.score - a.score);

		const top3 = scores.slice(0, 3);
		context = top3.map(s => knowledgeBase.chunks[s.index]).join('\n---\n');
		console.log(
			`🔍 Top similarity scores:`,
			top3.map(s => s.score.toFixed(3)),
		);
	}

	// 3. Génération via OpenRouter
	const { OpenAI } = await import('openai');
	const openai = new OpenAI({
		apiKey: process.env.OPENROUTER_API_KEY,
		baseURL: 'https://openrouter.ai/api/v1',
	});

  console.log('context', context);
  

	const prompt = `Tu es l'assistant officiel de la Plateforme d'échange ARMP.
Réponds uniquement avec les informations ci-dessous. Si la réponse n'est pas dans les documents, dis : "Je ne sais pas."

Documents :
---
${context}
---

Question : ${question}

Réponse :`;

	const chatCompletion = await openai.chat.completions.create({
		model: 'qwen/qwen3-coder:free',
		messages: [{ role: 'user', content: prompt }],
		temperature: 0.2,
		max_tokens: 500,
	});

	return chatCompletion.choices[0].message.content.trim();
}

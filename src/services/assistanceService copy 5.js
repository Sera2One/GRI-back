// assistanceService.js
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import Fuse from 'fuse.js';
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';

const publicFolder = process.env.APP_PUBLIC_FOLDER;
const DOCUMENTS_DIR = path.join(publicFolder, 'Post/documents');
const CACHE_FILE = path.join(publicFolder, 'Post/documents.json');

let searchableChunks = []; // [{ id, title, content }]

// Découpage intelligent pour textes juridiques
function splitIntoArticles(text) {
	const lines = text.split('\n');
	const articles = [];
	let current = { title: '', content: '' };

	for (const line of lines) {
		const match = line.match(/^(Article\s+\d+\.?-?\s*.+)/i);
		if (match) {
			if (current.title) articles.push({ ...current });
			current = { title: match[1].trim(), content: line + '\n' };
		} else {
			current.content += line + '\n';
		}
	}
	if (current.title) articles.push(current);
	return articles;
}

// Indexation au démarrage
export async function initVectorStore() {
	if (!fs.existsSync(DOCUMENTS_DIR)) {
		fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
		console.log(`📁 Dossier ${DOCUMENTS_DIR} créé.`);
	}

	console.log('🔍 Parsing des PDF/DOCX...');
	const allChunks = [];

	if (fs.existsSync(DOCUMENTS_DIR)) {
		const files = fs.readdirSync(DOCUMENTS_DIR);
		for (const file of files) {
			const fullPath = path.join(DOCUMENTS_DIR, file);
			try {
				let docs = [];
				if (file.endsWith('.pdf')) {
					const loader = new PDFLoader(fullPath);
					docs = await loader.load();
				} else if (file.endsWith('.docx')) {
					const loader = new DocxLoader(fullPath);
					docs = await loader.load();
				}

				for (const doc of docs) {
					const articles = splitIntoArticles(doc.pageContent);
					allChunks.push(...articles);
				}
			} catch (err) {
				console.warn(`⚠️ Erreur lecture ${file}:`, err.message);
			}
		}
	}

	searchableChunks = allChunks;
	fs.writeFileSync(CACHE_FILE, JSON.stringify(allChunks, null, 2));
	console.log(`✅ ${allChunks.length} articles indexés (recherche textuelle).`);
}

// Charger depuis cache
export function loadFromCache() {
	if (fs.existsSync(CACHE_FILE)) {
		searchableChunks = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
		console.log(
			`📂 ${searchableChunks.length} articles chargés depuis le cache.`,
		);
	}
}

export function isVectorStoreReady() {
	return searchableChunks.length > 0;
}

// Recherche textuelle intelligente (fuzzy + mots-clés)
function retrieveRelevantChunks(query, topK = 3) {
	// Si la question contient "Article X", recherche exacte
	const articleMatch = query.match(/Article\s+(\d+)/i);
	if (articleMatch) {
		const num = articleMatch[1];
		const exact = searchableChunks.find(c =>
			new RegExp(`Article\\s+${num}\\.?-?`, 'i').test(c.title),
		);
		if (exact) return [exact];
	}

	// Sinon, fuzzy search sur le titre + contenu
	const fuse = new Fuse(searchableChunks, {
		keys: ['title', 'content'],
		threshold: 0.3, // assez permissif
		includeScore: true,
	});

	const results = fuse.search(query, { limit: topK });
	return results.map(r => r.item);
}

// Génération avec Qwen2.5-7B local
export async function askAssistance(question) {
	if (searchableChunks.length === 0) {
		throw new Error('Base non chargée');
	}

	const relevant = retrieveRelevantChunks(question, 3);
	const context = relevant
		.map(item => `${item.title}\n${item.content}`)
		.join('\n---\n');

	const openai = new OpenAI({
		apiKey: 'not-needed', // pas de clé pour llama.cpp
		baseURL: 'http://localhost:8000/v1',
	});

	const prompt = `Tu es un expert des marchés publics à Madagascar. 
Réponds uniquement avec les documents fournis. Si l'information n'est pas présente, dis : "Je ne sais pas."

Documents :
---
${context}
---

Question : ${question}

Réponse :`;

	const chatCompletion = await openai.chat.completions.create({
		model: 'qwen2.5-7b-instruct', // nom du modèle chargé
		messages: [{ role: 'user', content: prompt }],
		temperature: 0.2,
		max_tokens: 500,
	});

	return chatCompletion.choices[0].message.content.trim();
}

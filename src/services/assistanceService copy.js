// assistanceService.js
import { ChromaClient } from 'chromadb';
import { OpenAIEmbeddingFunction } from '@chroma-core/openai';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAI } from "openai";
import fs from 'fs';
import path from 'path';

// lib qui n'existe pas
// import { ChromaClient, OpenAIEmbeddingFunction } from 'chromadb';
// import { PDFLoader } from "langchain/document_loaders/fs/pdf";
// import { CharacterTextSplitter } from 'langchain/text_splitter';


// Configuration
const publicFolder = process.env.APP_PUBLIC_FOLDER;

// Configuration
const DOCUMENTS_DIR = publicFolder + '/Post/documents';
const PERSIST_DIR = publicFolder + '/Post/vector-store';
const COLLECTION_NAME = 'armp_docs';

let client = null;
let collection = null;

export function isVectorStoreReady() {
  return collection !== null;
}

// ----------------------------
// Initialisation de Chroma (local, persistant)
// ----------------------------
export async function initVectorStore() {
	if (!fs.existsSync(DOCUMENTS_DIR)) {
		fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
		console.log(`📁 Dossier ${DOCUMENTS_DIR} créé.`);
	}

	console.log('🔍 Parsing des documents...');

	const docs = [];
	if (fs.existsSync(DOCUMENTS_DIR)) {
		console.log('DOCUMENTS_DIR', DOCUMENTS_DIR);

		const files = fs.readdirSync(DOCUMENTS_DIR);
		console.log('files', files);

		for (const file of files) {
			const fullPath = path.join(DOCUMENTS_DIR, file);
			try {
				if (file.endsWith('.pdf')) {
					console.log('fullPath', fullPath);

					const loader = new PDFLoader(fullPath);
					console.log('loader', loader);

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
	const splitDocs = await splitter.splitDocuments(docs);

	// Textes et métadonnées
	const texts = splitDocs.map(d => d.pageContent);
	const ids = splitDocs.map((_, i) => `id_${i}`);
	const metadatas = splitDocs.map(d => d.metadata);

	console.log('ids', ids);

	console.log('PERSIST_DIR', PERSIST_DIR);

	// Démarrer Chroma en mode persistant (sans Docker)

	client = new ChromaClient({ path: PERSIST_DIR }); // ← Persistance locale

	/* 
  Dans le doc officiel https://cookbook.chromadb.dev/core/clients/#http-client : 
  const client = new ChromaClient({
    path: "http://localhost:8000",
    auth: {
        provider: "token",
        credentials: "your_token_here",
        tokenHeaderType: "AUTHORIZATION",
    },
    tenant: "default_tenant",
    database: "default_database",
});

Notre path est /mnt/sdb6/PEA/Plate_forme-d'echange/PUBLIC_DEV/Post/vector-store

  
  */

	console.log('client', client);

	// Fonction d’embedding via OpenRouter (compatible OpenAI)
	const embeddingFunction = new OpenAIEmbeddingFunction({
		openai_api_key: process.env.OPENROUTER_API_KEY,
		openai_api_base: 'https://openrouter.ai/api/v1',
		model_name: 'text-embedding-3-small', // modèle gratuit sur OpenRouter
	});

	console.log('embeddingFunction', embeddingFunction);

	// Créer ou récupérer la collection
	try {
		collection = await client.getCollection({ name: COLLECTION_NAME });
		console.log('📂 Collection existante chargée.');
	} catch {
		collection = await client.createCollection({
			name: COLLECTION_NAME,
			embeddingFunction,
		});
		console.log('🆕 Nouvelle collection créée.');
	}

	// Ajouter les documents (idempotent : tu peux relancer sans doublons si besoin)
	try {
		await collection.add({ ids, documents: texts, metadatas });
		console.log(`✅ ${texts.length} chunks ajoutés.`);
	} catch (e) {
		console.warn(
			'ℹ️ Documents probablement déjà présents (erreur normale en réindexation).',
		);
	}
}

// ----------------------------
// Recherche + Génération
// ----------------------------
export async function askAssistance(question) {
  if (!collection) {
    throw new Error("Base non initialisée");
  }

  // Recherche sémantique
  const result = await collection.query({
    queryTexts: [question],
    nResults: 3,
  });

  const context = result.documents[0].join("\n---\n");
  

  // Appel à DeepSeek via OpenRouter
  const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
  });

  const prompt = `Tu es l'assistant officiel de la Plateforme d'échange ARMP.
Réponds uniquement avec les informations ci-dessous. Si la réponse n'est pas dans les documents, dis : "Je ne sais pas."

Documents :
---
${context}
---

Question : ${question}

Réponse :`;

  const chatCompletion = await openai.chat.completions.create({
    model: "deepseek/deepseek-r1-distill-llama-70b:free",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 400,
  });

  return chatCompletion.choices[0].message.content.trim();
}
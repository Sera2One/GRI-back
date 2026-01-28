import { askAssistance, isVectorStoreReady } from "../../services/assistanceService.js";
import { OpenAI } from 'openai';

export async function handleAskB(req, res) {
	const { question } = req.body;

	if (!question?.trim()) {
		return res.status(400).json({ error: 'Question manquante ou vide.' });
	}

	try {
		const answer = await askAssistance(question);
		res.json({ answer });
	} catch (error) {
		console.error('❌ Erreur dans handleAsk :', error.message);
		res
			.status(500)
			.json({ error: error.message || 'Échec de génération de la réponse.' });
	}
}

export function handleHealth(req, res) {
	res.json({
		status: 'ok',
		vectorStoreReady: isVectorStoreReady(),
	});
}

export async function handleAsk(req, res) {
	const { messages } = req.body;

	const openai = new OpenAI({
		apiKey: 'not-needed',
		baseURL: 'http://127.0.0.1:8080/v1', // Important : /v1 pour OpenAI API
	});

	try {
		const stream = await openai.chat.completions.create({
			model: 'qwen2.5-7b-instruct',
			messages,
			temperature: 0.2,
			max_tokens: 500,
			stream: true, // ← clé ici !
		});

		// Passe le stream directement au client
		res.setHeader('Content-Type', 'text/plain; charset=utf-8');
		res.setHeader('Cache-Control', 'no-cache');
		res.setHeader('Connection', 'keep-alive');

		for await (const chunk of stream) {
			const content = chunk.choices[0]?.delta?.content || '';
			if (content) {
				res.write(content);
			}
		}
		res.end();
	} catch (err) {
		console.error('Streaming error:', err);
		res.status(500).end('Erreur serveur');
	}
}

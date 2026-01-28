import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config();

export default {
	// Chemins
	projectRoot: __dirname,
	llamaServerPath: process.env.LLAMA_SERVER_PATH
		? join(__dirname, process.env.LLAMA_SERVER_PATH)
		: join(__dirname, '../lib/llama.cpp/bin/llama-server'),

	// Llama server config
	llamaConfig: {
		port: process.env.LLAMA_PORT,
		model: process.env.LLAMA_MODEL,
		noMmap: process.env.LLAMA_NO_MMAP === 'true',
		gpuLayers: parseInt(process.env.LLAMA_GPU_LAYERS),
		contextSize: parseInt(process.env.LLAMA_CONTEXT_SIZE),
		chatTemplate: process.env.LLAMA_CHAT_TEMPLATE,
		modelPath: process.env.LLAMA_MODEL_PATH
			? process.env.LLAMA_MODEL_PATH
			: join(__dirname, '../model_ia'),
		chatName: process.env.LLMA_NAME,
	},

	// Application config
	maxLogLines: parseInt(process.env.MAX_LOG_LINES) || 1000,

	// Validation
	validate() {
		const required = ['LLAMA_MODEL'];
		const missing = required.filter(field => !process.env[field]);

		if (missing.length > 0) {
			throw new Error(
				`Variables d'environnement manquantes: ${missing.join(', ')}`,
			);
		}
	},
};

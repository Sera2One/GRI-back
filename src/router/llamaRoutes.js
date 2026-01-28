
import express from 'express';
import llamaController from '../controller/llama/llamaController.js';

const llamaRoutes = express.Router();

// Routes pour le serveur Llama
llamaRoutes.post('/start', llamaController.startServer);
llamaRoutes.post('/stop', llamaController.stopServer);
llamaRoutes.get('/status', llamaController.getStatus);
llamaRoutes.get('/logs', llamaController.getLogs);
llamaRoutes.get('/logs/stream', llamaController.streamLogs);

// Route de santé
llamaRoutes.get('/health', llamaController.healthCheck);

export default llamaRoutes;
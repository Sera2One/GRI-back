import llamaService from '../../services/llamaService.js';

class LlamaController {
	/**
	 * Démarrer le serveur Llama
	 */
	async startServer(req, res, next) {
		try {
			const result = await llamaService.startServer();
			res.json(result);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Arrêter le serveur Llama
	 */
	async stopServer(req, res, next) {
		try {
			const result = await llamaService.stopServer();
			res.json(result);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Obtenir le statut du serveur
	 */
	getStatus(req, res, next) {
		try {
			const status = llamaService.getStatus();
			res.json({
				success: true,
				status,
			});
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Obtenir les logs
	 */
	getLogs(req, res, next) {
		try {
			const limit = parseInt(req.query.limit) || 100;
			const logs = llamaService.getLogs(limit);
			res.json({
				success: true,
				logs,
				count: logs.length,
			});
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Stream des logs en temps réel
	 */
	streamLogs(req, res, next) {
		try {
			llamaService.streamLogs(req, res);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Endpoint de santé
	 */
	healthCheck(req, res, next) {
		try {
			const status = llamaService.getStatus();
			res.json({
				status: 'ok',
				timestamp: new Date().toISOString(),
				llama: {
					running: status.isRunning,
					pid: status.pid,
					uptime: status.uptime,
				},
			});
		} catch (error) {
			next(error);
		}
	}
}

// Export singleton instance
export default new LlamaController();

import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import config from '../config/environment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class LlamaService {
	constructor() {
		this.llamaProcess = null;
		this.logs = [];
		this.startTime = null;
	}

	/**
	 * Vérifier si l'exécutable existe
	 */
	async checkExecutable() {
		const fs = await import('fs');
		return new Promise(resolve => {
			fs.access(config.llamaServerPath, fs.constants.X_OK, err => {
				resolve(!err);
			});
		});
	}

	/**
	 * Démarrer le serveur Llama
	 */
	startServer() {
		console.log('config', config);
		return new Promise(async (resolve, reject) => {
			if (this.llamaProcess) {
				return reject(
					new Error("Le serveur llama est déjà en cours d'exécution"),
				);
			}

			// Vérifier l'existence de l'exécutable
			const executableExists = await this.checkExecutable();
			if (!executableExists) {
				return reject(
					new Error(
						`Executable non trouvé: ${config.llamaServerPath}\n` +
							`Assurez-vous que:\n` +
							`1. llama.cpp est compilé\n` +
							`2. Le chemin est correct\n` +
							`3. L'exécutable a les permissions d'exécution (chmod +x)`,
					),
				);
			}

			// Construire le chemin complet du modèle
			const modelFullPath = join(
				config.llamaConfig.modelPath,
				config.llamaConfig.model,
			);

			const args = [
				'-m',
				modelFullPath,
				'--port',
				config.llamaConfig.port.toString(),
				'-ngl',
				config.llamaConfig.gpuLayers.toString(),
				'-n',
				config.llamaConfig.contextSize.toString(),
				'--chat-template',
				config.llamaConfig.chatTemplate,
				'-a',
				config.llamaConfig.chatName,
			];

			// Ajouter --no-mmap si configuré
			if (config.llamaConfig.noMmap) {
				args.push('--no-mmap');
			}

			console.log(
				`Démarrage de llama-server depuis: ${config.llamaServerPath}`,
			);
			console.log(`Modèle: ${modelFullPath}`);
			console.log(`Arguments: ${args.join(' ')}`);

			try {
				this.llamaProcess = spawn(config.llamaServerPath, args, {
					stdio: ['pipe', 'pipe', 'pipe'],
					env: {
						...process.env,
						LD_LIBRARY_PATH: config.llamaServerPath.includes('llama.cpp')
							? join(dirname(config.llamaServerPath), '../lib')
							: process.env.LD_LIBRARY_PATH,
					},
					cwd: dirname(config.llamaServerPath), // Définir le répertoire de travail
				});

				this.startTime = new Date();

				// Gestion des logs stdout
				this.llamaProcess.stdout.on('data', data => {
					this.addLog('stdout', data.toString());
				});

				// Gestion des logs stderr
				this.llamaProcess.stderr.on('data', data => {
					this.addLog('stderr', data.toString());
				});

				// Gestion de la fermeture du processus
				this.llamaProcess.on('close', code => {
					this.addLog('system', `Processus terminé avec le code: ${code}`);
					this.llamaProcess = null;
					this.startTime = null;
				});

				// Gestion des erreurs de spawn
				this.llamaProcess.on('error', error => {
					this.addLog('error', `Erreur du processus: ${error.message}`);
					this.llamaProcess = null;
					this.startTime = null;
					reject(error);
				});

				// Attendre que le serveur soit prêt
				setTimeout(() => {
					if (this.llamaProcess && !this.llamaProcess.killed) {
						this.addLog('system', 'Serveur llama démarré avec succès');
						resolve({
							success: true,
							message: 'Serveur llama démarré avec succès',
							pid: this.llamaProcess.pid,
							port: config.llamaConfig.port,
							executable: config.llamaServerPath,
							model: modelFullPath,
						});
					}
				}, 8000);
			} catch (error) {
				reject(new Error(`Erreur lors du démarrage: ${error.message}`));
			}
		});
	}

	/**
	 * Arrêter le serveur Llama
	 */
	stopServer() {
		return new Promise((resolve, reject) => {
			if (!this.llamaProcess) {
				return reject(
					new Error("Le serveur llama n'est pas en cours d'exécution"),
				);
			}

			this.addLog('system', 'Arrêt du serveur llama en cours...');

			this.llamaProcess.kill('SIGTERM');

			const checkInterval = setInterval(() => {
				if (!this.llamaProcess) {
					clearInterval(checkInterval);
					resolve({
						success: true,
						message: 'Serveur llama arrêté avec succès',
					});
				}
			}, 100);

			// Timeout après 10 secondes
			setTimeout(() => {
				if (this.llamaProcess) {
					this.llamaProcess.kill('SIGKILL');
					clearInterval(checkInterval);
					resolve({
						success: true,
						message: "Serveur llama forcé à s'arrêter",
					});
				}
			}, 10000);
		});
	}

	/**
	 * Obtenir le statut du serveur
	 */
	getStatus() {
		return {
			isRunning: !!this.llamaProcess,
			pid: this.llamaProcess ? this.llamaProcess.pid : null,
			startTime: this.startTime,
			uptime: this.startTime ? Date.now() - this.startTime.getTime() : null,
			config: config.llamaConfig,
			executablePath: config.llamaServerPath,
			logCount: this.logs.length,
		};
	}

	/**
	 * Obtenir les logs
	 */
	getLogs(limit = 100) {
		return this.logs.slice(-limit);
	}

	/**
	 * Stream des logs en temps réel
	 */
	streamLogs(req, res) {
		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Credentials': 'true',
		});

		res.write(': connection established\n\n');

		// Envoyer les logs existants
		this.logs.forEach(log => {
			res.write(
				`data: ${JSON.stringify({
					timestamp: log.timestamp,
					type: log.type,
					message: log.message,
				})}\n\n`,
			);
		});

		// Fonction pour envoyer les nouveaux logs
		const sendNewLog = logEntry => {
			res.write(
				`data: ${JSON.stringify({
					timestamp: logEntry.timestamp,
					type: logEntry.type,
					message: logEntry.message,
				})}\n\n`,
			);
		};

		// Stocker la référence pour cleanup
		const originalAddLog = this.addLog.bind(this);
		let isStreamActive = true;

		// Intercepter les nouveaux logs
		this.addLog = (type, message) => {
			const logEntry = originalAddLog(type, message);
			if (isStreamActive) {
				sendNewLog(logEntry);
			}
			return logEntry;
		};

		// Garder la connexion active avec des commentaires
		const keepAliveInterval = setInterval(() => {
			if (isStreamActive) {
				res.write(': keepalive\n\n');
			}
		}, 30000);

		req.on('end', () => {
			console.log('SSE connection ended');
			isStreamActive = false;
			clearInterval(keepAliveInterval);
			this.addLog = originalAddLog;
		});

		req.on('error', err => {
			console.error('SSE connection error:', err);
			isStreamActive = false;
			clearInterval(keepAliveInterval);
			this.addLog = originalAddLog;
		});
	}

	/**
	 * Ajouter un log
	 */
	addLog(type, message) {
		const logEntry = {
			id: Date.now() + Math.random(),
			timestamp: new Date().toISOString(),
			type,
			message,
		};

		this.logs.push(logEntry);

		// Garder seulement les derniers logs
		if (this.logs.length > config.maxLogLines) {
			this.logs = this.logs.slice(-config.maxLogLines);
		}

		console.log(`[${type.toUpperCase()}] ${message.trim()}`);

		return logEntry;
	}
}

// Export singleton instance
export default new LlamaService();

import { exec } from 'node:child_process';

export function getSystemUptime() {
	return new Promise((resolve, reject) => {
		exec('uptime -s', (error, stdout, stderr) => {
			if (error) {
				console.error('Erreur uptime -s:', error);
				return resolve(null); // fallback
			}
			if (stderr) {
				console.warn('stderr uptime:', stderr);
			}

			const uptimeStr = stdout.trim(); // ex: "2025-09-22 08:03:54"
			if (!uptimeStr) {
				return resolve(null);
			}

			// Parser la date
			const bootTime = new Date(uptimeStr.replace(' ', 'T') + 'Z'); // Convertir en UTC pour éviter les problèmes de fuseau
			if (isNaN(bootTime.getTime())) {
				console.error('Date invalide:', uptimeStr);
				return resolve(null);
			}

			resolve(bootTime);
		});
	});
}

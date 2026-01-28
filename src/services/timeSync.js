// timeSync.js

import { fetchWithTimeout } from "./fetchWithTimeout.js";

// Stockage en mémoire du décalage
let timeOffset = 0;
let lastSync = null;

const TIME_APIS = [
	'https://worldtimeapi.org/api/timezone/etc/utc',
	'https://timeapi.io/api/Time/current/zone?timeZone=UTC',
	'https://www.timeapi.io/api/Time/current/zone?timeZone=Etc/UTC',
];

/**
 * Initialise la synchronisation au démarrage
 */
export async function initializeTimeSync() {
	console.log("🕐 Synchronisation de l'heure...");

	const offsets = [];

	for (const apiUrl of TIME_APIS) {
		try {
			const startTime = Date.now();
			const response = await fetchWithTimeout(apiUrl, { timeout: 5000 });
			const endTime = Date.now();

			const latency = (endTime - startTime) / 2;
			let apiTimestamp;

                  if (apiUrl.includes('worldtimeapi.org')) {
                        apiTimestamp = new Date(response.utc_datetime).getTime();
                  } else if (apiUrl.includes('timeapi.io')) {
                        apiTimestamp = new Date(response.dateTime).getTime();
                  }

			const offset = apiTimestamp + latency - endTime;
			offsets.push(offset);
			console.log(`✅ Décalage: ${offset.toFixed(2)}ms`);
		} catch (error) {
			console.warn(`⚠️ API ${apiUrl} échouée`);
		}
	}

	if (offsets.length > 0) {
		timeOffset = offsets.reduce((a, b) => a + b, 0) / offsets.length;
		lastSync = new Date().toISOString();
		console.log(`✅ Décalage moyen: ${timeOffset.toFixed(2)}ms`);
	} else {
		console.warn(
			'⚠️ Aucune API de synchronisation disponible. Utilisation de l’heure système.',
		);
		timeOffset = 0;
	}

	return { offset: timeOffset, lastSync };
}

/**
 * Fonction PRINCIPALE : Retourne le timestamp précis (à utiliser PARTOUT)
 */
export function getPreciseTimestamp() {
	return Date.now() + timeOffset;
}

/**
 * Retourne un objet Date précis
 */
export function getPreciseDate() {
	return new Date(getPreciseTimestamp());
}

/**
 * Retourne l'heure GMT/UTC formatée
 */
export function getPreciseGMTTime() {
	const timestamp = getPreciseTimestamp();
	return {
		timestamp,
		iso: new Date(timestamp).toISOString(),
		gmt: new Date(timestamp).toGMTString(),
	};
}

/**
 * Middleware Express : injecte le temps précis dans req
 */
export function preciseTimeMiddleware(req, res, next) {
	req.preciseTimestamp = getPreciseTimestamp();
	req.preciseDate = getPreciseDate();
	next();
}

export function getSyncStatus() {
	return { offset: timeOffset, lastSync, isSynced: lastSync !== null };
}

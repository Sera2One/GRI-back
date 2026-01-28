// fetchWithTimeout.js

/**
 * Effectue une requête fetch avec un timeout.
 * @param {string} url
 * @param {Object} [options={}]
 * @param {number} [options.timeout=5000] - Délai en millisecondes
 * @returns {Promise<any>} - Données JSON de la réponse
 */
export async function fetchWithTimeout(url, options = {}) {
	const timeout = options.timeout ?? 5000;

	const controller = new AbortController();
	const { signal } = controller;

	const timeoutId = setTimeout(() => {
		controller.abort();
	}, timeout);

	try {

		const response = await fetch(url, {
			...options,
			signal,
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		clearTimeout(timeoutId);

		if (error.name === 'AbortError') {
			console.error(`❌ Timeout dépassé (${timeout}ms) pour l'URL :`, url);
		} else {
			console.error(
				'❌ Erreur réseau ou serveur lors de la requête vers :',
				url,
				error.message || error,
			);
		}

		throw error; // Relancer pour que l'appelant puisse gérer l'échec
	}
}

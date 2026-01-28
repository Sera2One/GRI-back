/**
 * Middleware de gestion des erreurs
 */
export function errorHandler(err, req, res, next) {
	console.error('Erreur:', err);

	// Erreur de validation
	if (
		err.message.includes('déjà en cours') ||
		err.message.includes("n'est pas en cours")
	) {
		return res.status(409).json({
			success: false,
			error: err.message,
		});
	}

	// Erreur de processus
	if (err.code === 'ENOENT') {
		return res.status(500).json({
			success: false,
			error:
				"Commande llama-server non trouvée. Assurez-vous qu'elle est installée et dans le PATH.",
		});
	}

	// Erreur générique
	res.status(500).json({
		success: false,
		error: 'Erreur interne du serveur',
		message: process.env.NODE_ENV === 'development' ? err.message : undefined,
	});
}

/**
 * Middleware pour les routes non trouvées
 */
export function notFoundHandler(req, res, next) {
	res.status(404).json({
		success: false,
		error: 'Route non trouvée',
	});
}

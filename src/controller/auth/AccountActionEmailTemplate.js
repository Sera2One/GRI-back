// AccountActionEmailTemplate.js

export const AccountActionEmailTemplate = (user, emailType) => {
	const templates = {
		admin_valid_nouveau_compte: `
			<h1>Validation de votre compte</h1>
			<p>Bonjour, Mm(e) <strong>${user.usrName} ${user.usrFirstname}</strong>,</p>
			<p>Votre compte sur la plateforme <strong>Helpdesk ARMP</strong> a été validé par un administrateur.</p>
			<p>Vous pouvez désormais vous connecter et accéder à tous les services disponibles.</p>
		`,

		desactivation_compte_temporaire: `
			<h1>Désactivation temporaire de votre compte</h1>
			<p>Bonjour, Mm(e) <strong>${user.usrName} ${user.usrFirstname}</strong>,</p>
			<p>Votre compte sur la plateforme <strong>Helpdesk ARMP</strong> a été temporairement désactivé par un administrateur.</p>
			<p>Pour toute question, veuillez contacter le service support.</p>
		`,

		admin_suppression_compte: `
			<h1>Suppression de votre compte</h1>
			<p>Bonjour, Mm(e) <strong>${user.usrName} ${user.usrFirstname}</strong>,</p>
			<p>Votre compte sur la plateforme <strong>Helpdesk ARMP</strong> a été supprimé par un administrateur.</p>
			<p>Si cette action est une erreur, veuillez contacter immédiatement le support technique.</p>
		`,

		restoration_compte_supprimer: `
			<h1>Restauration de votre compte</h1>
			<p>Bonjour, Mm(e) <strong>${user.usrName} ${user.usrFirstname}</strong>,</p>
			<p>Votre compte sur la plateforme <strong>Helpdesk ARMP</strong> a été restauré par un administrateur.</p>
			<p>Vous pouvez de nouveau vous connecter normalement.</p>
		`,
	};

	const emailContent = templates[emailType] || '';

	return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Action sur votre compte - GRI Helpdesk ARMP</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
        }
        p {
            color: #555;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        ${emailContent}
        <p>Merci,</p>
        <p>L'équipe DSI ARMP</p>
        <div class="footer">
            <p>&copy; 2025 GRI Helpdesk service ARMP. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
	`;
};

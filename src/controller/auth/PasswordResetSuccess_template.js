export const PasswordResetSuccess_render = (newPasword, user ) => {
      return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Succès de Réinitialisation du Mot de Passe</title>
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
        .password {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
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
        <h1>Réinitialisation de Mot de Passe Réussie</h1>
        <p>Bonjour, Mm(e) <strong>${user.usrName} ${user.usrFirstname}</strong></p>
        <p>Votre mot de passe a été réinitialisé avec succès pour votre compte sur le GRI ARMP.</p>
        <p>Votre nouveau mot de passe est :</p>
        <p class="password">${newPasword}</p>
        <p>Veuillez <strong>modifier votre mot de passe pour sécuriser votre compte</strong> dès que possible.</p>
        <p>Si vous n'avez pas effectué cette demande, veuillez contacter notre support.</p>
        <p>Merci,</p>
        <p>L'équipe DSI ARMP</p>
        <div class="footer">
            <p>&copy; 2025 GRI Helpdesk service ARMP. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
`;
}
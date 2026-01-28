export const otp_render_view = (OTP_value, user ) => {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation du Mot de Passe</title>
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
        .code {
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
        <h1>Réinitialisation de votre Mot de Passe</h1>
        <p>Bonjour, Mm(e) <strong>${user.usrName} ${user.usrFirstname} </strong></p>
        <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte sur le GRI Helpdesk ARMP.</p>
        <p>Pour continuer, veuillez utiliser le code de réinitialisation ci-dessous :</p>
        <p class="code">${OTP_value}</p>
        <p>Ce code est valide pour une durée limitée. Veuillez l'utiliser pour créer un nouveau mot de passe.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer ce message.</p>
        <p>Merci,</p>
        <p>L'équipe DSI ARMP</p>
        <div class="footer">
            <p>&copy; 2025 GRI Helpdesk service ARMP. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
`
}
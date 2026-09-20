export const VAULT_ACCESS_GRANTED = (
	role: string,
	collectionName: string,
	collectionUrl: string,
) => {
	const lowerRole = role.toLowerCase();
	let message =
		"You have been granted viewer access to a password vault collection. You can now access the shared passwords.";

	if (lowerRole === "admin") {
		message =
			"You have been granted administrative access to a password vault collection. You can now manage passwords and sharing.";
	} else if (lowerRole === "editor") {
		message =
			"You have been granted editor access to a password vault collection. You can now add and edit passwords.";
	}

	return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Snipit Vault Access Granted</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafafa; margin: 0; padding: 40px 0; color: #09090b; }
        .container { max-width: 540px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; margin: 0 auto; padding: 32px; text-align: center; }
        .btn-primary { background-color: #18181b; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; display: inline-block; margin-top: 24px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Vault Access Shared</h2>
        <p>${message}</p>
        <p><strong>Role:</strong> ${role}</p>
        <p><strong>Collection:</strong> ${collectionName}</p>
        <a class="btn-primary" href="${collectionUrl}">Open Vault</a>
    </div>
</body>
</html>`;
};

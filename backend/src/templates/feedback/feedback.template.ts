export const FEEDBACK_RECEIVED = (
	type: string,
	title: string,
	description: string,
	userEmail: string,
) => {
	return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Feedback Received</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafafa; margin: 0; padding: 40px 0; color: #09090b; }
        .container { max-width: 540px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; margin: 0 auto; padding: 32px; }
        .label { font-weight: bold; color: #71717a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
        .value { margin-top: 4px; margin-bottom: 24px; font-size: 16px; }
        .desc { white-space: pre-wrap; background: #f4f4f5; padding: 12px; border-radius: 8px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <h2 style="text-align: center; margin-top: 0;">New Feedback Received</h2>
        
        <div class="label">Type</div>
        <div class="value">${type.toUpperCase()}</div>

        <div class="label">From</div>
        <div class="value">${userEmail || "Anonymous"}</div>

        <div class="label">Title</div>
        <div class="value">${title}</div>

        <div class="label">Description</div>
        <div class="value desc">${description}</div>
    </div>
</body>
</html>`;
};

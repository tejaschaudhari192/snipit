import dotenv from "dotenv";

dotenv.config();
const configurations = {
	port: process.env.PORT || 3000,
	domain: process.env.DOMAIN,
	database: {
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		name: process.env.DB_NAME,
	},
	groq_api_key: process.env.GROQ_API_KEY,
	jwt: {
		secret: process.env.JWT_SECRET || "default_secret",
		expiry: "30d",
	},
	cookie: {
		maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
	},
	cors: {
		origins: [
			"https://cpaste.vercel.app",
			"https://snipit-nu.vercel.app",
			"http://localhost:5173",
			"http://192.168.0.2:5173",
		],
	},
	job_secret: process.env.JOB_SECRET,
	SUPABASE_URL: process.env.SUPABASE_URL,
	SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
	SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET,
	smtp: {
		service: process.env.SMTP_SERVICE || "gmail",
		host: process.env.SMTP_HOST,
		port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
		from: process.env.SMTP_FROM || process.env.SMTP_USER,
	},
};

export default configurations;

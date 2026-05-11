import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
	PORT: z.string(),
	DOMAIN: z.string().url(),
	DB_USER: z.string(),
	DB_PASSWORD: z.string(),
	DB_NAME: z.string(),
	GOOGLE_CLIENT_ID: z.string(),
	GROQ_API_KEY: z.string(),
	GROQ_DUMB_MODEL: z.string(),
	GROQ_SMART_MODEL: z.string(),
	GROQ_WHISPER_MODEL: z.string(),
	GROQ_MODELS: z.string(),
	JWT_SECRET: z.string(),
	JOB_SECRET: z.string(),
	SUPABASE_URL: z.string().url(),
	SUPABASE_SERVICE_ROLE_KEY: z.string(),
	SUPABASE_STORAGE_BUCKET: z.string(),
	SMTP_SERVICE: z.string().optional(),
	SMTP_HOST: z.string().optional(),
	SMTP_PORT: z.string().optional(),
	SMTP_USER: z.string().optional(),
	SMTP_PASS: z.string().optional(),
	SMTP_FROM: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
	console.error(
		"❌ Invalid environment variables:",
		JSON.stringify(parsedEnv.error.format(), null, 2),
	);
	process.exit(1);
}

const env = parsedEnv.data;

const configurations = {
	port: parseInt(env.PORT, 10),
	domain: env.DOMAIN,
	database: {
		user: env.DB_USER,
		password: env.DB_PASSWORD,
		name: env.DB_NAME,
	},
	google_client_id: env.GOOGLE_CLIENT_ID,
	groq_api_key: env.GROQ_API_KEY,
	groq_dumb_model: env.GROQ_DUMB_MODEL,
	groq_smart_model: env.GROQ_SMART_MODEL,
	groq_whisper_model: env.GROQ_WHISPER_MODEL,
	groq_models: env.GROQ_MODELS.split(",").map((m) => m.trim()),
	jwt: {
		secret: env.JWT_SECRET,
		expiry: "30d",
	},
	cookie: {
		maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
	},
	cors: {
		origins: [
			"https://cpaste.vercel.app",
			"https://snipit-nu.vercel.app"
		],
	},
	job_secret: env.JOB_SECRET,
	supabase_url: env.SUPABASE_URL,
	supabase_service_role_key: env.SUPABASE_SERVICE_ROLE_KEY,
	supabase_storage_bucket: env.SUPABASE_STORAGE_BUCKET,
	smtp: {
		service: env.SMTP_SERVICE,
		host: env.SMTP_HOST,
		port: parseInt(env.SMTP_PORT!, 10),
		user: env.SMTP_USER,
		pass: env.SMTP_PASS,
		from: env.SMTP_FROM || env.SMTP_USER,
	},
};

export default configurations;

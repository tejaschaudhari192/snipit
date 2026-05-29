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
	GROQ_AUDIO_MODEL: z.string(),
	GROQ_MODELS: z.string(),
	JWT_SECRET: z.string(),
	JOB_SECRET: z.string(),
	SUPABASE_URL: z.string().url(),
	SUPABASE_SERVICE_ROLE_KEY: z.string(),
	SUPABASE_STORAGE_BUCKET: z.string(),
	YOUTUBE_API_KEY: z.string(),
	BREVO_SENDER: z.string(),
	BREVO_API_KEY: z.string(),
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
	groq_audio_model: env.GROQ_AUDIO_MODEL,
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
			"https://snipit-nu.vercel.app",
			"http://localhost:5173",
			"https://snipit-git-55-watch-media-sy-8f336e-tejaschaudhari192s-projects.vercel.app",
			...networkOrigins,
		],
	},
	job_secret: env.JOB_SECRET,
	supabase_url: env.SUPABASE_URL,
	supabase_service_role_key: env.SUPABASE_SERVICE_ROLE_KEY,
	supabase_storage_bucket: env.SUPABASE_STORAGE_BUCKET,
	youtube_api_key: env.YOUTUBE_API_KEY,
	brevo: {
		apiKey: env.BREVO_API_KEY,
		sender: env.BREVO_SENDER,
	},
};

export default configurations;

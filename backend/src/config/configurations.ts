import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
	NODE_ENV: z.string(),
	PORT: z.string(),
	DOMAIN: z.string().url(),
	DB_USER: z.string(),
	DB_PASSWORD: z.string(),
	DB_NAME: z.string(),
	GOOGLE_CLIENT_ID: z.string(),
	GROQ_API_KEY: z.string(),
	GROQ_DUMB_MODEL: z.string().optional(),
	GROQ_SMART_MODEL: z.string().optional(),
	GROQ_VOICE_MODEL: z.string().optional(),
	GROQ_GUARD_MODEL: z.string().optional(),
	GROQ_AUDIO_MODEL: z.string().optional(),
	GROQ_AUDIO_MODELS: z.string().optional(),
	GROQ_MODELS: z.string().optional(),
	GROQ_VOICE_MODELS: z.string().optional(),
	JWT_SECRET: z.string(),
	JOB_SECRET: z.string(),
	SUPABASE_URL: z.string().url(),
	SUPABASE_SERVICE_ROLE_KEY: z.string(),
	SUPABASE_STORAGE_BUCKET: z.string(),
	YOUTUBE_API_KEY: z.string(),
	BREVO_SENDER: z.string(),
	BREVO_API_KEY: z.string(),
	LIVEKIT_API_KEY: z.string(),
	LIVEKIT_API_SECRET: z.string(),
	ADMIN_EMAIL: z.string().email().optional(),
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

import { GROQ_CONFIG } from "./groq.config.js";

const configurations = {
	node_env: env.NODE_ENV,
	port: parseInt(env.PORT, 10),
	domain: env.DOMAIN,
	database: {
		user: env.DB_USER,
		password: env.DB_PASSWORD,
		name: env.DB_NAME,
	},
	google_client_id: env.GOOGLE_CLIENT_ID,
	groq_api_key: env.GROQ_API_KEY,
	groq_dumb_model: GROQ_CONFIG.models.dumb,
	groq_smart_model: GROQ_CONFIG.models.smart,
	groq_voice_model: GROQ_CONFIG.voice.primary,
	groq_guard_model: GROQ_CONFIG.voice.guard,
	groq_audio_model: GROQ_CONFIG.audio.primary,
	groq_audio_models: GROQ_CONFIG.audio.fallbackList,
	groq_models: GROQ_CONFIG.models.generalList,
	groq_voice_models: GROQ_CONFIG.voice.fallbackList,
	jwt: {
		secret: env.JWT_SECRET,
		expiry: "15d",
	},
	cookie: {
		maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
	},
	cors: {
		origins: [
			"https://cpaste.vercel.app",
			"https://snipit-nu.vercel.app",
			"https://cpaste.onrender.com",
			"http://localhost:5173",
		],
		methods: "GET,POST,PUT,DELETE,PATCH",
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
	livekit: {
		apiKey: env.LIVEKIT_API_KEY,
		apiSecret: env.LIVEKIT_API_SECRET,
	},
	adminEmail: env.ADMIN_EMAIL,
};

export default configurations;

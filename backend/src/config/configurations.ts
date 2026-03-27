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

export const CONTENT_MODES = ["text", "code", "link", "file"] as const;
export const VISIBILITIES = ["public", "private", "shared"] as const;
export const EDIT_PERMISSIONS = ["owner", "shared", "public"] as const;
export const ROLES = ["viewer", "editor", "admin", "commenter"] as const;

export const ADJECTIVES = [
	"Anonymous",
	"Secret",
	"Hidden",
	"Silent",
	"Mysterious",
	"Ghostly",
	"Shadowy",
	"Invisible",
	"Stealthy",
];
export const ANIMALS = [
	"Panda",
	"Tiger",
	"Fox",
	"Wolf",
	"Owl",
	"Bear",
	"Cat",
	"Dog",
	"Rabbit",
	"Dragon",
	"Phoenix",
];
export const COLLABORATOR_COLORS = [
	"#ef4444",
	"#f97316",
	"#f59e0b",
	"#84cc16",
	"#22c55e",
	"#10b981",
	"#06b6d4",
	"#0ea5e9",
	"#3b82f6",
	"#6366f1",
	"#8b5cf6",
	"#d946ef",
	"#f43f5e",
];

export const VALID_LANGUAGES = [
	"javascript",
	"typescript",
	"html",
	"css",
	"json",
	"java",
	"python",
	"c",
	"cpp",
	"csharp",
	"go",
	"rust",
	"markdown",
	"shell",
	"bash",
	"other",
	"text",
];

export default configurations;

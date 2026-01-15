import dotenv from "dotenv";

dotenv.config();
const configurations = {
	port: process.env.PORT,
	domain: process.env.DOMAIN,
	database: {
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		name: process.env.DB_NAME,
	},
	groq_api_key: process.env.GROQ_API_KEY,
};

export default configurations;

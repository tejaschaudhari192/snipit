import * as Application from "expo-application";
import Constants from "expo-constants";
import appConfig from "../../app.json";

/**
 * Global environment and app configuration
 */
export const CONFIG = {
	DEFAULT_API_URL: "https://snipit-yer5.onrender.com/api/v1" as string,
	APP_NAME: "Snipit",
	get APP_VERSION(): string {
		return (
			Application.nativeApplicationVersion ||
			Constants.expoConfig?.version ||
			appConfig.expo.version
		);
	},
	CLIENT_ID: "snipit-mobile",
};

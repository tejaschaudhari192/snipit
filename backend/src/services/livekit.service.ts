import { AccessToken } from "livekit-server-sdk";
import configurations from "@/config/configurations.js";

export const generateLiveKitToken = async (
	roomName: string,
	identity: string,
	isHost: boolean,
): Promise<string> => {
	const apiKey = configurations.livekit.apiKey;
	const apiSecret = configurations.livekit.apiSecret;

	const token = new AccessToken(apiKey, apiSecret, {
		identity,
		ttl: "2h",
	});

	token.addGrant({
		roomJoin: true,
		room: roomName,
		canPublish: isHost,
		canSubscribe: true,
		canPublishData: true,
	});

	const jwt = await token.toJwt();
	return jwt;
};

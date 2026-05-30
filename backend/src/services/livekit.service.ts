import { AccessToken } from "livekit-server-sdk";

export const generateLiveKitToken = async (
	roomName: string,
	identity: string,
	isHost: boolean,
): Promise<string> => {
	const apiKey = process.env.LIVEKIT_API_KEY || "devkey";
	const apiSecret = process.env.LIVEKIT_API_SECRET || "secretkey123";

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

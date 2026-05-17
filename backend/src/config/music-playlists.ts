export interface RegionPlaylist {
	region: string;
	displayName: string;
	searchQueries: string[]; // Rotated for variety
	fallbackPlaylistIds: string[]; // Known good YouTube playlist IDs
}

export const REGION_PLAYLISTS: Record<string, RegionPlaylist> = {
	maharashtra: {
		region: "maharashtra",
		displayName: "Marathi",
		searchQueries: ["Marathi Music", "Marathi Songs"],
		fallbackPlaylistIds: [],
	},
	tamil_nadu: {
		region: "tamil_nadu",
		displayName: "Tamil",
		searchQueries: ["Tamil Music", "Tamil Songs"],
		fallbackPlaylistIds: [],
	},
	karnataka: {
		region: "karnataka",
		displayName: "Kannada",
		searchQueries: ["Kannada Music", "Kannada Songs"],
		fallbackPlaylistIds: [],
	},
	kerala: {
		region: "kerala",
		displayName: "Malayalam",
		searchQueries: ["Malayalam Music", "Malayalam Songs"],
		fallbackPlaylistIds: [],
	},
	telangana: {
		region: "telangana",
		displayName: "Telugu",
		searchQueries: ["Telugu Music", "Telugu Songs"],
		fallbackPlaylistIds: [],
	},
	andhra_pradesh: {
		region: "andhra_pradesh",
		displayName: "Telugu",
		searchQueries: ["Telugu Music", "Telugu Songs"],
		fallbackPlaylistIds: [],
	},
	west_bengal: {
		region: "west_bengal",
		displayName: "Bengali",
		searchQueries: ["Bengali Music", "Bengali Songs"],
		fallbackPlaylistIds: [],
	},
	punjab: {
		region: "punjab",
		displayName: "Punjabi",
		searchQueries: ["Punjabi Music", "Punjabi Songs"],
		fallbackPlaylistIds: [],
	},
	gujarat: {
		region: "gujarat",
		displayName: "Gujarati",
		searchQueries: ["Gujarati Music", "Gujarati Songs"],
		fallbackPlaylistIds: [],
	},
	default: {
		region: "default",
		displayName: "Hindi",
		searchQueries: ["Hindi Music", "Hindi Songs"],
		fallbackPlaylistIds: [],
	},
	english: {
		region: "english",
		displayName: "English",
		searchQueries: ["English Music", "English Songs"],
		fallbackPlaylistIds: [],
	},
};

export const HINDI_BELT_STATES = [
	"uttar_pradesh",
	"madhya_pradesh",
	"bihar",
	"rajasthan",
	"jharkhand",
	"chhattisgarh",
	"uttarakhand",
	"haryana",
	"himachal_pradesh",
	"delhi",
];

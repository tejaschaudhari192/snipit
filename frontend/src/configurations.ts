/**
 * Frontend Configuration Constants
 */

export const CONFIG = {
	// Password Configuration
	password: {
		minLength: 8,
		requireUppercase: true,
		requireNumber: true,
		requireSpecial: true,
		minZxcvbnScore: 2,
	},

	// API Configuration
	apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
	giphyApiKey: import.meta.env.VITE_GIPHY_API_KEY,

	// Supabase Configuration
	supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
	supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
	supabaseStorageBucket: import.meta.env.VITE_SUPABASE_STORAGE_BUCKET,

	// Google Auth Configuration
	googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,

	// LiveKit Configuration
	livekit: {
		mediaProvider: import.meta.env.VITE_MEDIA_PROVIDER,
		wsUrl: import.meta.env.VITE_LIVEKIT_WS_URL,
	},

	// Storage Keys
	storageKeys: {
		fontSize: "snipit-font-size",
		language: "snipit-last-language",
		theme: "snipit-theme",
		history: "snipit-history",
		terminalPosition: "snipit-terminal-position",
		aiAutocomplete: "snipit-ai-autocomplete",
		musicVolume: "snipit-music-volume",
		musicQuality: "snipit-music-quality",
		musicEnabled: "snipit-music-enabled",
		musicPlaylistIds: "snipit-music-playlist-ids",
		musicCurrentTrackId: "snipit-music-current-track-id",
		musicCurrentIndex: "snipit-music-current-index",
		musicPlaytime: "snipit-music-playtime",
		autosave: "snipit-autosave",
		plaintextEditorMode: "snipit-plaintext-editor-mode",
		editorEngine: "snipit_editor_engine",
		transliterationEnabled: "transliteration-enabled",
		transliterationLang: "transliteration-lang",
		markdownLayoutMode: "markdown-layout-mode",
		linkHistoryVisible: "link-history-visible",
		musicBubbleVisible: "music-bubble-visible",
		appLanguage: "lang",
		githubRepoData: "snipit-github-repo-data",
		localizationIssues: "snipit-localization-issues",
	},

	// GitHub Configuration
	github: {
		owner: "tejaschaudhari192",
		repo: "snipit",
		repoUrl: "https://github.com/tejaschaudhari192/snipit",
		cacheDurationMs: 3 * 60 * 60 * 1000, // 3 hours cache
	},

	// Custom Event Names
	events: {
		editorEngineChange: "snipit_editor_engine_change",
		transliterationChange: "snipit_transliteration_change",
		aiAutocompleteChange: "snipit_ai_autocomplete_change",
	},

	// Default Values
	defaults: {
		fontSize: 14,
		minFontSize: 8,
		maxFontSize: 48,
		language: "text",
		expiry: "1w",
		visibility: "public" as const,
		editPermission: "owner" as const,
		publicRole: "viewer" as const,
		contentMode: "text" as const,
		maxFileSize: 50 * 1024 * 1024, // 50MB
		musicSaveInterval: 5,
	},

	// UI Constants
	ui: {
		detectionDelay: 2000,
		toastDuration: 3000,
		waveformSpeed: 4, // Higher = Slower (skip frames)
		uploadProgressInterval: 200,
		syncQuarantineMs: 1000,
	},
};

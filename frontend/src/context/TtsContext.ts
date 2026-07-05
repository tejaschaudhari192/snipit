import { createContext } from "react";

export interface TtsContextProps {
	isPlaying: boolean;
	isPaused: boolean;
	isPreparing: boolean;
	isModelLoading: boolean;
	modelProgress: number;
	spokenText: string;
	currentVoice: string;
	currentLanguage: string;
	currentEngine: string;
	currentTime: number;
	duration: number;
	speak: (content: string, contentType: string) => Promise<void>;
	pause: () => void;
	resume: () => void;
	stop: () => void;
	seek: (time: number) => void;
}

export const TtsContext = createContext<TtsContextProps | undefined>(undefined);

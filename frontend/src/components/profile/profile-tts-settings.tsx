import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GlassBadge } from "@/components/common/core/glass-badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface ProfileTtsSettingsProps {
	ttsVoice: string;
	onVoiceChange: (voice: string) => void;
}

const KOKORO_VOICES = [
	// American English - Female
	{ id: "af_heart", name: "American Female (Heart - Recommended)" },
	{ id: "af_bella", name: "American Female (Bella)" },
	{ id: "af_sarah", name: "American Female (Sarah)" },
	{ id: "af_sky", name: "American Female (Sky)" },
	{ id: "af_nicole", name: "American Female (Nicole)" },
	{ id: "af_nova", name: "American Female (Nova)" },
	{ id: "af_alloy", name: "American Female (Alloy)" },
	{ id: "af_aoede", name: "American Female (Aoede)" },
	{ id: "af_jessica", name: "American Female (Jessica)" },
	{ id: "af_kore", name: "American Female (Kore)" },
	{ id: "af_river", name: "American Female (River)" },

	// American English - Male
	{ id: "am_adam", name: "American Male (Adam)" },
	{ id: "am_michael", name: "American Male (Michael)" },
	{ id: "am_echo", name: "American Male (Echo)" },
	{ id: "am_eric", name: "American Male (Eric)" },
	{ id: "am_fenrir", name: "American Male (Fenrir)" },
	{ id: "am_liam", name: "American Male (Liam)" },
	{ id: "am_onyx", name: "American Male (Onyx)" },
	{ id: "am_puck", name: "American Male (Puck)" },
	{ id: "am_santa", name: "American Male (Santa)" },

	// British English - Female
	{ id: "bf_emma", name: "British Female (Emma)" },
	{ id: "bf_isabella", name: "British Female (Isabella)" },
	{ id: "bf_alice", name: "British Female (Alice)" },
	{ id: "bf_lily", name: "British Female (Lily)" },

	// British English - Male
	{ id: "bm_george", name: "British Male (George)" },
	{ id: "bm_lewis", name: "British Male (Lewis)" },
	{ id: "bm_daniel", name: "British Male (Daniel)" },
	{ id: "bm_fable", name: "British Male (Fable)" },
];

export const ProfileTtsSettings: React.FC<ProfileTtsSettingsProps> = ({
	ttsVoice,
	onVoiceChange,
}) => {
	return (
		<div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
			<Card className="border border-border/50 bg-background/60 backdrop-blur-3xl shadow-xl rounded-4xl overflow-hidden ring-1 ring-white/5">
				<CardContent className="p-8 space-y-6">
					<div className="flex items-center justify-between border-b border-border/50 pb-4">
						<h3 className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground">
							Text-to-Speech settings
						</h3>
						<GlassBadge
							size="xs"
							className="italic text-primary/60"
							variant="glass"
						>
							local preference
						</GlassBadge>
					</div>
					<div className="space-y-4">
						<div className="flex flex-col gap-2">
							<span className="text-sm font-medium text-muted-foreground">
								Preferred TTS voice for read aloud
							</span>
							<Select
								value={ttsVoice}
								onValueChange={onVoiceChange}
							>
								<SelectTrigger className="w-full h-11 bg-background/50 border border-border/50 hover:bg-muted/50 rounded-2xl px-4 transition-all text-sm font-medium">
									<SelectValue placeholder="Select Voice" />
								</SelectTrigger>
								<SelectContent className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl max-h-60 overflow-y-auto custom-scrollbar">
									{KOKORO_VOICES.map((voice) => (
										<SelectItem
											key={voice.id}
											value={voice.id}
											className="text-sm focus:bg-primary/20 focus:text-primary rounded-xl cursor-pointer"
										>
											{voice.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

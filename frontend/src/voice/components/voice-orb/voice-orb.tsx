import React, { useState } from "react";
import { useVoiceAgent } from "../../hooks/use-voice-agent";
import { VoiceHUD } from "../voice-hud";
import { VoicePanelHeader } from "./voice-panel-header";
import { VoiceInputPanel } from "./voice-input-panel";
import { VoiceKeyboardToggle } from "./voice-keyboard-toggle";
import { VoiceOrbTrigger } from "./voice-orb-trigger";

export const VoiceOrb: React.FC = () => {
	const {
		status,
		transcript,
		activeActionDescription,
		startListening,
		stopListening,
		cancel,
		sendTextMessage,
	} = useVoiceAgent();

	const [isPanelOpen, setIsPanelOpen] = useState(false);

	const isListening = status === "listening";
	const isThinking = status === "thinking";
	const isExecuting = status === "executing";
	const isObserving = status === "observing";
	const isSpeaking = status === "speaking";

	const handleOrbClick = () => {
		if (isListening) {
			stopListening();
		} else if (isThinking || isExecuting || isObserving || isSpeaking) {
			cancel();
		} else {
			setIsPanelOpen(true);
			startListening();
		}
	};

	const handleClosePanel = () => {
		setIsPanelOpen(false);
		cancel();
	};

	return (
		<div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
			{/* HUD feedback for ongoing operations */}
			{(isThinking || isExecuting || isObserving || isSpeaking) && (
				<VoiceHUD
					status={status}
					transcript={transcript}
					activeAction={activeActionDescription}
					onCancel={cancel}
				/>
			)}

			{/* Floating Prompt Pill & Transcript Container */}
			{isPanelOpen && (
				<div className="mb-3 w-84 sm:w-96 rounded-3xl bg-neutral-900/95 border border-white/15 backdrop-blur-2xl shadow-2xl text-white p-3.5 animate-in fade-in slide-in-from-bottom-4 duration-300">
					<VoicePanelHeader
						isSpeaking={isSpeaking}
						onClose={handleClosePanel}
					/>
					<VoiceInputPanel
						status={status}
						transcript={transcript}
						activeActionDescription={activeActionDescription}
						isListening={isListening}
						onStartListening={startListening}
						onStopListening={stopListening}
						onSubmitText={sendTextMessage}
						onClose={handleClosePanel}
					/>
				</div>
			)}

			{/* Action Bubble Group */}
			<div className="flex items-center gap-2">
				{!isPanelOpen && (
					<VoiceKeyboardToggle onClick={() => setIsPanelOpen(true)} />
				)}
				<VoiceOrbTrigger status={status} onClick={handleOrbClick} />
			</div>
		</div>
	);
};

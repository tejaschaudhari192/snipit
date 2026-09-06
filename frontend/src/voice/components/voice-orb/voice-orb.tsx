import React, { useState, useEffect } from "react";
import { useVoiceAgent } from "../../hooks/use-voice-agent";
import { VoiceHUD } from "../voice-hud";
import { VoiceKeyboardToggle } from "./voice-keyboard-toggle";
import { VoiceOrbTrigger } from "./voice-orb-trigger";
import { VoiceChatPanel } from "../chat";

export const VoiceOrb: React.FC = () => {
	const {
		status,
		transcript,
		activeActionDescription,
		executionSteps,
		startListening,
		stopListening,
		cancel,
		sendTextMessage,
		isMascotVisible,
		setIsMascotVisible,
		messages,
		clearMessages,
	} = useVoiceAgent();

	const [isPanelOpen, setIsPanelOpen] = useState(false);

	// Global keyboard shortcut: Ctrl+J or Cmd+J toggles chat panel
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "j") {
				e.preventDefault();
				setIsPanelOpen((prev) => !prev);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	if (!isMascotVisible) return null;

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
			{/* Minimal HUD feedback when panel is closed and agent is active */}
			{!isPanelOpen &&
				(isThinking || isExecuting || isObserving || isSpeaking) && (
					<VoiceHUD
						status={status}
						transcript={transcript}
						activeAction={activeActionDescription}
						executionSteps={executionSteps}
						onCancel={cancel}
					/>
				)}

			{/* Shadcn AI Conversational Chat Panel */}
			{isPanelOpen && (
				<div className="mb-3">
					<VoiceChatPanel
						status={status}
						messages={messages}
						isListening={isListening}
						isSpeaking={isSpeaking}
						isMascotVisible={isMascotVisible}
						onStartListening={startListening}
						onStopListening={stopListening}
						onSendMessage={sendTextMessage}
						onClearMessages={clearMessages}
						onClose={handleClosePanel}
					/>
				</div>
			)}

			{/* Floating Trigger Controls (Visible when panel is closed) */}
			{!isPanelOpen && (
				<div className="flex items-end gap-2">
					<VoiceKeyboardToggle onClick={() => setIsPanelOpen(true)} />
					<VoiceOrbTrigger
						status={status}
						onClick={handleOrbClick}
						onClose={() => setIsMascotVisible(false)}
					/>
				</div>
			)}
		</div>
	);
};

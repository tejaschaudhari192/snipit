import React, { useState, useEffect, useRef, useMemo } from "react";
import type { AiMascotProps, MascotMovement } from "./mascot.types";
import { mascotAudio } from "./mascot-audio";

/**
 * Nick Wilde (Disney's Zootopia) Animated Fox Companion
 * - Accurate attire: Mint-green tropical Hawaiian shirt with palm leaves, loosely knotted navy striped tie, khaki pants.
 * - Facial identity: Emerald-green eyes (half-lidded with cursor pupil tracking), arched skeptical brow, white muzzle, sly asymmetrical smirk.
 * - Body language: Slouchy cool idle, tie-adjusting thought pose, swiveling ears, charismatic talking gestures, finger-guns victory.
 * - Zero external npm dependencies + procedural Web Audio sound synthesis.
 */
export const AiMascot: React.FC<AiMascotProps> = ({
	movement: propMovement,
	status,
	onClick,
	size = 130,
	className = "",
	showSpeechBubble = false,
	speechText = "",
	mode = "standing",
	enableSounds = true,
}) => {
	const [isHovered, setIsHovered] = useState(false);
	const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
	const mascotRef = useRef<HTMLDivElement>(null);
	const prevStatusRef = useRef(status);

	// Map VoiceAgentStatus to MascotMovement
	const currentMovement: MascotMovement = useMemo(() => {
		if (propMovement) return propMovement;
		if (isHovered && (!status || status === "idle")) return "waving";

		switch (status) {
			case "listening":
				return "listening";
			case "thinking":
				return "thinking";
			case "executing":
				return "executing";
			case "observing":
				return "observing";
			case "speaking":
				return "speaking";
			case "error":
				return "error";
			default:
				return "idle";
		}
	}, [propMovement, status, isHovered]);

	// Play procedural audio cues on status change
	useEffect(() => {
		if (!enableSounds) return;

		if (status === "listening" && prevStatusRef.current !== "listening") {
			mascotAudio.playWakeChime();
		} else if (
			(status === "idle" || status === "speaking") &&
			prevStatusRef.current === "executing"
		) {
			mascotAudio.playDoneChime();
		}

		prevStatusRef.current = status;
	}, [status, enableSounds]);

	// Smooth pupil cursor tracking
	useEffect(() => {
		let rafId: number;

		const handleMouseMove = (e: MouseEvent) => {
			if (!mascotRef.current) return;
			rafId = requestAnimationFrame(() => {
				const rect = mascotRef.current?.getBoundingClientRect();
				if (!rect) return;

				const centerX = rect.left + rect.width / 2;
				const centerY = rect.top + rect.height * 0.32;

				const deltaX = e.clientX - centerX;
				const deltaY = e.clientY - centerY;
				const distance = Math.hypot(deltaX, deltaY);

				if (distance === 0) {
					setPupilOffset({ x: 0, y: 0 });
					return;
				}

				const maxRadius = 3.2;
				const clampedRadius = Math.min(distance / 35, maxRadius);
				const angle = Math.atan2(deltaY, deltaX);

				setPupilOffset({
					x: Math.cos(angle) * clampedRadius,
					y: Math.sin(angle) * clampedRadius,
				});
			});
		};

		window.addEventListener("mousemove", handleMouseMove, {
			passive: true,
		});
		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			cancelAnimationFrame(rafId);
		};
	}, []);

	const handleClick = () => {
		if (enableSounds) mascotAudio.playPop();
		onClick?.();
	};

	const isSpeaking = currentMovement === "speaking";
	const isListening = currentMovement === "listening";
	const isThinking = currentMovement === "thinking";
	const isWaving = currentMovement === "waving";
	const isCelebrating = currentMovement === "celebrate";
	const isSleeping = currentMovement === "sleeping";
	const isError = currentMovement === "error";

	// Nick's signature dialog lines
	const getGreetingBubble = () => {
		if (speechText) return speechText;
		if (isWaving) return "Hey Carrots! What's the play? 😏";
		if (isThinking) return "Calculating the hustle... 🦊";
		if (isListening) return "I'm all ears, slick! 👂";
		return "";
	};

	const displayBubble =
		(showSpeechBubble && speechText) || isWaving || isThinking;
	const bubbleText = getGreetingBubble();

	return (
		<div
			ref={mascotRef}
			onClick={handleClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className={`relative select-none flex flex-col items-center justify-end cursor-pointer transition-transform duration-200 active:scale-95 ${className}`}
			style={{ width: size, height: size * 1.25 }}
			role="button"
			tabIndex={0}
			aria-label="Nick Wilde AI Fox Assistant"
		>
			{/* Speech / Thought Bubble */}
			{displayBubble && bubbleText && (
				<div className="absolute -top-11 right-0 max-w-52 px-3 py-1.5 bg-neutral-950/95 border border-amber-500/40 rounded-2xl text-[11px] font-medium text-amber-200 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 pointer-events-none truncate z-30 flex items-center gap-1.5">
					<span>{bubbleText}</span>
					<div className="absolute -bottom-1 right-7 w-2 h-2 bg-neutral-950 rotate-45 border-r border-b border-amber-500/40" />
				</div>
			)}

			{/* Ground Ambient Glow */}
			{mode === "standing" && (
				<div
					className="absolute bottom-0 w-3/4 h-3 rounded-full blur-md opacity-50 transition-colors duration-500 pointer-events-none"
					style={{
						backgroundColor: isListening
							? "rgba(244, 63, 94, 0.5)"
							: isThinking
								? "rgba(251, 191, 36, 0.5)"
								: isSpeaking
									? "rgba(59, 130, 246, 0.5)"
									: "rgba(16, 185, 129, 0.4)",
					}}
				/>
			)}

			{/* NICK WILDE SVG VECTOR CHARACTER */}
			<svg
				viewBox="0 0 130 165"
				className="w-full h-full overflow-visible"
				style={{
					filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.35))",
				}}
			>
				<defs>
					{/* Fox Red-Orange Fur Gradient */}
					<linearGradient
						id="nickFur"
						x1="0%"
						y1="0%"
						x2="0%"
						y2="100%"
					>
						<stop offset="0%" stopColor="#f97316" />
						<stop offset="60%" stopColor="#ea580c" />
						<stop offset="100%" stopColor="#c2410c" />
					</linearGradient>

					{/* Cream Muzzle & Chest Fur */}
					<linearGradient
						id="nickCream"
						x1="0%"
						y1="0%"
						x2="0%"
						y2="100%"
					>
						<stop offset="0%" stopColor="#ffffff" />
						<stop offset="100%" stopColor="#fef3c7" />
					</linearGradient>

					{/* Hawaiian Mint-Green Shirt */}
					<linearGradient
						id="nickShirt"
						x1="0%"
						y1="0%"
						x2="100%"
						y2="100%"
					>
						<stop offset="0%" stopColor="#5eead4" />
						<stop offset="50%" stopColor="#2dd4bf" />
						<stop offset="100%" stopColor="#0f766e" />
					</linearGradient>

					{/* Khaki Trousers */}
					<linearGradient
						id="nickPants"
						x1="0%"
						y1="0%"
						x2="0%"
						y2="100%"
					>
						<stop offset="0%" stopColor="#d97706" />
						<stop offset="100%" stopColor="#92400e" />
					</linearGradient>

					{/* Navy Tie with Diagonal Stripes */}
					<linearGradient
						id="nickTie"
						x1="0%"
						y1="0%"
						x2="100%"
						y2="100%"
					>
						<stop offset="0%" stopColor="#1e3a8a" />
						<stop offset="100%" stopColor="#172554" />
					</linearGradient>
				</defs>

				{/* 1. BUSHY WHITE-TIPPED FOX TAIL */}
				<g
					style={{
						transformOrigin: "40px 125px",
						animation: isCelebrating
							? "nickTailWagFast 0.35s infinite alternate ease-in-out"
							: isSpeaking || isWaving
								? "nickTailWag 0.8s infinite alternate ease-in-out"
								: "nickTailWag 2.6s infinite alternate ease-in-out",
					}}
				>
					{/* Tail Base */}
					<path
						d="M 40 120 C 18 114, 5 80, 14 56 C 18 42, 32 44, 34 58 C 36 76, 48 106, 54 122 Z"
						fill="url(#nickFur)"
					/>
					{/* Tail Fluffy Cream Tip */}
					<path
						d="M 14 56 C 18 42, 32 44, 34 58 C 31 49, 20 46, 14 56 Z"
						fill="url(#nickCream)"
					/>
				</g>

				{/* 2. LEGS & KHAKI PANTS (Standing in relaxed cool posture) */}
				{mode === "standing" && (
					<g id="nick-legs">
						{/* Left Leg */}
						<g
							style={{
								transformOrigin: "50px 135px",
								animation: isSpeaking
									? "nickFootTapLeft 1.2s infinite ease-in-out"
									: "none",
							}}
						>
							<path
								d="M 44 116 L 44 142 L 56 142 L 57 116 Z"
								fill="url(#nickPants)"
							/>
							{/* Dark Fox Paw / Shoe */}
							<ellipse
								cx="49"
								cy="145"
								rx="9"
								ry="5"
								fill="#334155"
							/>
							<circle cx="45" cy="146" r="1.5" fill="#64748b" />
							<circle cx="49" cy="147" r="1.5" fill="#64748b" />
							<circle cx="53" cy="146" r="1.5" fill="#64748b" />
						</g>

						{/* Right Leg */}
						<g
							style={{
								transformOrigin: "78px 135px",
								animation: isListening
									? "nickFootTapRight 1s infinite ease-in-out"
									: "none",
							}}
						>
							<path
								d="M 71 116 L 72 142 L 84 142 L 83 116 Z"
								fill="url(#nickPants)"
							/>
							{/* Dark Fox Paw / Shoe */}
							<ellipse
								cx="78"
								cy="145"
								rx="9"
								ry="5"
								fill="#334155"
							/>
							<circle cx="74" cy="146" r="1.5" fill="#64748b" />
							<circle cx="78" cy="147" r="1.5" fill="#64748b" />
							<circle cx="82" cy="146" r="1.5" fill="#64748b" />
						</g>
					</g>
				)}

				{/* 3. UPPER BODY & HAWAIIAN SHIRT */}
				<g
					style={{
						transformOrigin: "64px 120px",
						animation: isCelebrating
							? "nickBounceCelebrate 0.4s infinite alternate ease-in-out"
							: isSpeaking
								? "nickBounceSpeak 0.6s infinite alternate ease-in-out"
								: "nickSlouchBreathe 3.2s infinite ease-in-out",
					}}
				>
					{/* Hawaiian Mint-Green Button-up Shirt Torso */}
					<path
						d="M 40 84 C 36 100, 39 120, 64 120 C 89 120, 92 100, 88 84 C 84 74, 44 74, 40 84 Z"
						fill="url(#nickShirt)"
						stroke="#0d9488"
						strokeWidth="1"
					/>

					{/* Tropical Palm Leaf Patterns on Shirt */}
					<path
						d="M 46 92 Q 52 88 56 94 Q 50 96 46 92 Z"
						fill="#14b8a6"
						opacity="0.6"
					/>
					<path
						d="M 72 98 Q 78 94 82 100 Q 76 102 72 98 Z"
						fill="#14b8a6"
						opacity="0.6"
					/>
					<path
						d="M 50 108 Q 56 104 60 110 Q 54 112 50 108 Z"
						fill="#14b8a6"
						opacity="0.6"
					/>

					{/* Open Collar Lapels */}
					<polygon
						points="50,78 58,88 64,80"
						fill="#2dd4bf"
						stroke="#0f766e"
						strokeWidth="0.8"
					/>
					<polygon
						points="78,78 70,88 64,80"
						fill="#2dd4bf"
						stroke="#0f766e"
						strokeWidth="0.8"
					/>

					{/* Cream Fur Peeking through Open Collar */}
					<polygon
						points="58,82 64,90 70,82"
						fill="url(#nickCream)"
					/>

					{/* NICK'S LOOSELY KNOTTED NAVY STRIPED TIE */}
					<g id="nick-tie">
						{/* Tie Knot */}
						<polygon
							points="61,86 67,86 66,91 62,91"
							fill="url(#nickTie)"
						/>
						{/* Tie Body */}
						<polygon
							points="62,91 66,91 70,116 64,122 58,116"
							fill="url(#nickTie)"
							stroke="#1e3a8a"
							strokeWidth="0.8"
						/>
						{/* Diagonal Stripes on Tie (Magenta/Pink & Indigo) */}
						<line
							x1="61"
							y1="96"
							x2="67"
							y2="99"
							stroke="#db2777"
							strokeWidth="2"
							strokeLinecap="round"
						/>
						<line
							x1="60"
							y1="104"
							x2="68"
							y2="108"
							stroke="#6366f1"
							strokeWidth="2"
							strokeLinecap="round"
						/>
						<line
							x1="60"
							y1="112"
							x2="67"
							y2="116"
							stroke="#db2777"
							strokeWidth="2"
							strokeLinecap="round"
						/>
					</g>

					{/* 4. ARMS & PAWS (Gestures, Tie Adjustment, Wave) */}

					{/* LEFT ARM (Relaxed on hip or holding tie) */}
					<g
						style={{
							transformOrigin: "41px 86px",
							animation: isThinking
								? "nickArmHoldHip 0.5s forwards"
								: isCelebrating
									? "nickCheerLeft 0.4s infinite alternate ease-in-out"
									: "nickArmRestLeft 3s infinite ease-in-out",
						}}
					>
						{/* Mint Short Sleeve */}
						<path
							d="M 40 85 L 30 96 L 39 100 L 45 88 Z"
							fill="url(#nickShirt)"
						/>
						{/* Orange Fur Forearm */}
						<path
							d="M 32 97 L 27 109 L 35 112 L 38 100 Z"
							fill="url(#nickFur)"
						/>
						{/* Dark Fox Paw */}
						<ellipse
							cx="29"
							cy="112"
							rx="5.5"
							ry="6"
							fill="#334155"
						/>
					</g>

					{/* RIGHT ARM (Animated Waving / Tie-Adjusting / Finger Guns) */}
					<g
						style={{
							transformOrigin: "87px 86px",
							animation: isWaving
								? "nickSlyWave 0.45s infinite alternate ease-in-out"
								: isThinking
									? "nickAdjustTie 1.4s infinite alternate ease-in-out"
									: isCelebrating
										? "nickFingerGuns 0.4s infinite alternate ease-in-out"
										: "nickArmRestRight 3s infinite ease-in-out",
						}}
					>
						{/* Mint Short Sleeve */}
						<path
							d="M 88 85 L 98 96 L 89 100 L 83 88 Z"
							fill="url(#nickShirt)"
						/>
						{/* Orange Fur Forearm */}
						<path
							d="M 96 97 L 101 109 L 93 112 L 90 100 Z"
							fill="url(#nickFur)"
						/>
						{/* Dark Fox Paw */}
						<ellipse
							cx="99"
							cy="112"
							rx="5.5"
							ry="6"
							fill="#334155"
						/>
					</g>

					{/* 5. HEAD & FACIAL EXPRESSIONS (Nick's Iconic Sly Smirk & Emerald Eyes) */}
					<g
						id="nick-head"
						style={{
							transformOrigin: "64px 72px",
							animation: isThinking
								? "nickHeadTiltThinking 2s infinite alternate ease-in-out"
								: isListening
									? "nickHeadTiltListening 1.4s infinite alternate ease-in-out"
									: "nickHeadBob 3.2s infinite ease-in-out",
						}}
					>
						{/* LEFT EAR (Pointed fox ear with black back & cream inner fluff) */}
						<g
							style={{
								transformOrigin: "42px 34px",
								animation: isListening
									? "nickEarTwitch 0.8s infinite ease-in-out"
									: "none",
							}}
						>
							{/* Black Outer Back */}
							<polygon
								points="34,40 24,10 50,26"
								fill="#1e293b"
							/>
							{/* Orange Front */}
							<polygon
								points="36,38 27,14 48,27"
								fill="url(#nickFur)"
							/>
							{/* Inner Cream Fur Fluff */}
							<polygon
								points="36,35 32,19 45,28"
								fill="url(#nickCream)"
							/>
						</g>

						{/* RIGHT EAR */}
						<g
							style={{
								transformOrigin: "86px 34px",
								animation: isListening
									? "nickEarTwitch 0.9s infinite ease-in-out 0.2s"
									: "none",
							}}
						>
							{/* Black Outer Back */}
							<polygon
								points="94,40 104,10 78,26"
								fill="#1e293b"
							/>
							{/* Orange Front */}
							<polygon
								points="92,38 101,14 80,27"
								fill="url(#nickFur)"
							/>
							{/* Inner Cream Fur Fluff */}
							<polygon
								points="92,35 96,19 83,28"
								fill="url(#nickCream)"
							/>
						</g>

						{/* HEAD FUR SHAPE (Slender triangular fox head with cheek tufts) */}
						<path
							d="M 36 48 C 26 56, 24 72, 38 76 C 46 78, 52 80, 64 80 C 76 80, 82 78, 90 76 C 104 72, 102 56, 92 48 C 86 32, 42 32, 36 48 Z"
							fill="url(#nickFur)"
						/>

						{/* WHITE / CREAM MUZZLE */}
						<path
							d="M 48 60 C 44 64, 46 74, 64 76 C 82 74, 84 64, 80 60 C 74 56, 54 56, 48 60 Z"
							fill="url(#nickCream)"
						/>

						{/* BLACK FOX NOSE */}
						<path
							d="M 61 63 Q 64 61 67 63 Q 64 67 61 63 Z"
							fill="#0f172a"
						/>
						<circle cx="63" cy="63" r="0.8" fill="#ffffff" />

						{/* MOUTH: NICK'S ICONIC ASYMMETRICAL SLY SMIRK */}
						{isSpeaking ? (
							/* Animated Talking Mouth with Visible Tooth & Tongue */
							<g>
								<path
									d="M 57 68 Q 64 77 71 67 Z"
									fill="#881337"
									stroke="#451a03"
									strokeWidth="1.2"
								/>
								<ellipse
									cx="64"
									cy="74"
									rx="4"
									ry="2.5"
									fill="#fb7185"
								/>
								{/* Fox Sharp Canine Tooth */}
								<polygon
									points="61,68 63,71 65,68"
									fill="#ffffff"
								/>
							</g>
						) : isCelebrating || isWaving ? (
							/* Cocky Toothy Smirk */
							<g>
								<path
									d="M 56 68 Q 62 70 72 65"
									fill="none"
									stroke="#451a03"
									strokeWidth="2"
									strokeLinecap="round"
								/>
								<polygon
									points="68,66 70,68 71,65"
									fill="#ffffff"
								/>
							</g>
						) : isThinking ? (
							/* Calculating Smirk */
							<path
								d="M 58 69 Q 65 69 71 66"
								fill="none"
								stroke="#451a03"
								strokeWidth="1.8"
								strokeLinecap="round"
							/>
						) : (
							/* Signature Half-Smirk */
							<path
								d="M 57 68 Q 63 70 71 66"
								fill="none"
								stroke="#451a03"
								strokeWidth="1.8"
								strokeLinecap="round"
							/>
						)}

						{/* EYEBROWS (Arched & Skeptical) */}
						{/* Left Brow: Raised skeptically */}
						<path
							d={
								isThinking
									? "M 46 44 Q 51 40 56 43"
									: "M 47 45 Q 51 42 56 44"
							}
							fill="none"
							stroke="#7c2d12"
							strokeWidth="2"
							strokeLinecap="round"
						/>
						{/* Right Brow: Arched high in signature smirk */}
						<path
							d={
								isThinking
									? "M 72 43 Q 77 39 82 44"
									: "M 72 44 Q 77 40 81 44"
							}
							fill="none"
							stroke="#7c2d12"
							strokeWidth="2.2"
							strokeLinecap="round"
						/>

						{/* EMERALD GREEN EYES (Half-lidded with cursor tracking) */}
						{isSleeping ? (
							/* Sleepy Eyelids */
							<g
								stroke="#451a03"
								strokeWidth="2.5"
								strokeLinecap="round"
								fill="none"
							>
								<path d="M 47 52 Q 52 56 57 52" />
								<path d="M 71 52 Q 76 56 81 52" />
							</g>
						) : isError ? (
							/* Dizzy X X Eyes on Error */
							<g
								stroke="#e11d48"
								strokeWidth="2.5"
								strokeLinecap="round"
							>
								<line x1="48" y1="48" x2="56" y2="56" />
								<line x1="56" y1="48" x2="48" y2="56" />
								<line x1="72" y1="48" x2="80" y2="56" />
								<line x1="80" y1="48" x2="72" y2="56" />
							</g>
						) : (
							<g>
								{/* Left Eye White */}
								<ellipse
									cx="52"
									cy="51"
									rx="6"
									ry="6.5"
									fill="#ffffff"
									stroke="#78350f"
									strokeWidth="1"
								/>
								{/* Right Eye White */}
								<ellipse
									cx="76"
									cy="51"
									rx="6"
									ry="6.5"
									fill="#ffffff"
									stroke="#78350f"
									strokeWidth="1"
								/>

								{/* Emerald Green Irises + Pupils with Cursor Tracking */}
								<g
									style={{
										transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
										transition: "transform 60ms ease-out",
									}}
								>
									{/* Emerald Green Irises */}
									<circle
										cx="52"
										cy="51"
										r="4.2"
										fill="#10b981"
									/>
									<circle
										cx="76"
										cy="51"
										r="4.2"
										fill="#10b981"
									/>

									{/* Black Pupils */}
									<circle
										cx="52"
										cy="51"
										r="2.4"
										fill="#022c22"
									/>
									<circle
										cx="76"
										cy="51"
										r="2.4"
										fill="#022c22"
									/>

									{/* Glossy Anime Catchlight Sparkles */}
									<circle
										cx="50.8"
										cy="49.8"
										r="1.3"
										fill="#ffffff"
									/>
									<circle
										cx="74.8"
										cy="49.8"
										r="1.3"
										fill="#ffffff"
									/>
								</g>

								{/* Nick's Signature Half-Lidded Upper Eyelids (Gives the charismatic sly look) */}
								<path
									d="M 46 47 Q 52 52 58 48 Q 52 46 46 47 Z"
									fill="url(#nickFur)"
								/>
								<path
									d="M 70 47 Q 76 52 82 48 Q 76 46 70 47 Z"
									fill="url(#nickFur)"
								/>
							</g>
						)}
					</g>
				</g>
			</svg>

			{/* NICK WILDE CSS KEYFRAME ANIMATIONS */}
			<style>{`
				@keyframes nickTailWag {
					0% { transform: rotate(-6deg); }
					100% { transform: rotate(18deg); }
				}
				@keyframes nickTailWagFast {
					0% { transform: rotate(-14deg); }
					100% { transform: rotate(26deg); }
				}
				@keyframes nickSlyWave {
					0% { transform: translate(4px, -14px) rotate(-40deg); }
					100% { transform: translate(12px, -28px) rotate(-105deg); }
				}
				@keyframes nickAdjustTie {
					0% { transform: translate(-8px, -20px) rotate(-55deg); }
					100% { transform: translate(-12px, -24px) rotate(-75deg); }
				}
				@keyframes nickFingerGuns {
					0% { transform: translate(8px, -22px) rotate(-90deg); }
					100% { transform: translate(14px, -30px) rotate(-115deg); }
				}
				@keyframes nickCheerLeft {
					0% { transform: translate(-4px, -18px) rotate(80deg); }
					100% { transform: translate(-8px, -26px) rotate(110deg); }
				}
				@keyframes nickArmRestRight {
					0% { transform: rotate(0deg); }
					50% { transform: rotate(2deg); }
					100% { transform: rotate(0deg); }
				}
				@keyframes nickArmRestLeft {
					0% { transform: rotate(0deg); }
					50% { transform: rotate(-2deg); }
					100% { transform: rotate(0deg); }
				}
				@keyframes nickFootTapLeft {
					0%, 80%, 100% { transform: translateY(0); }
					90% { transform: translateY(-3px); }
				}
				@keyframes nickFootTapRight {
					0%, 80%, 100% { transform: translateY(0); }
					90% { transform: translateY(-3px); }
				}
				@keyframes nickSlouchBreathe {
					0%, 100% { transform: translateY(0) scaleY(1); }
					50% { transform: translateY(-2px) scaleY(1.015); }
				}
				@keyframes nickBounceSpeak {
					0% { transform: translateY(0) scale(1); }
					100% { transform: translateY(-3px) scale(1.02); }
				}
				@keyframes nickBounceCelebrate {
					0% { transform: translateY(0) scale(1); }
					100% { transform: translateY(-7px) scale(1.04); }
				}
				@keyframes nickHeadTiltThinking {
					0% { transform: rotate(-2deg); }
					100% { transform: rotate(8deg); }
				}
				@keyframes nickHeadTiltListening {
					0% { transform: rotate(-3deg); }
					100% { transform: rotate(5deg); }
				}
				@keyframes nickHeadBob {
					0%, 100% { transform: translateY(0); }
					50% { transform: translateY(-1px); }
				}
				@keyframes nickEarTwitch {
					0%, 80%, 100% { transform: rotate(0deg); }
					85% { transform: rotate(-8deg); }
					95% { transform: rotate(6deg); }
				}
			`}</style>
		</div>
	);
};

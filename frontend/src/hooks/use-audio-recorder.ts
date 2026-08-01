import { useState, useRef, useCallback } from "react";
import { CONFIG } from "@/configurations";
import { calculateRMS } from "@/utils/audio";

export const useAudioRecorder = () => {
	const [isRecording, setIsRecording] = useState(false);
	const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
	const [waveform, setWaveform] = useState<number[]>(new Array(80).fill(0));
	const [duration, setDuration] = useState(0);

	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const animationFrameRef = useRef<number | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const frameCounterRef = useRef(0);
	const lastAmplitudeRef = useRef(0);

	const startRecording = useCallback(async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
			});
			streamRef.current = stream;

			// Timer logic
			setDuration(0);
			timerRef.current = setInterval(() => {
				setDuration((prev) => prev + 1);
			}, 1000);

			// Setup Web Audio API for visualization
			const audioContext = new AudioContext();
			const source = audioContext.createMediaStreamSource(stream);
			const analyser = audioContext.createAnalyser();
			analyser.fftSize = 256;
			source.connect(analyser);

			audioContextRef.current = audioContext;
			analyserRef.current = analyser;

			const dataArray = new Uint8Array(analyser.frequencyBinCount);
			setWaveform(new Array(80).fill(0));
			frameCounterRef.current = 0;
			lastAmplitudeRef.current = 0;

			const updateVisualizer = () => {
				if (analyserRef.current) {
					analyserRef.current.getByteTimeDomainData(dataArray);

					// Only update waveform history every N frames to control speed
					frameCounterRef.current++;
					if (
						frameCounterRef.current >=
						(CONFIG.ui.waveformSpeed || 1)
					) {
						frameCounterRef.current = 0;

						const rawAmplitude = calculateRMS(dataArray);

						// Smooth out the movement (EMA)
						const smoothing = 0.3; // Lower = smoother
						const amplitude =
							rawAmplitude * smoothing +
							lastAmplitudeRef.current * (1 - smoothing);
						lastAmplitudeRef.current = amplitude;

						setWaveform((prev) => {
							const next = [...prev.slice(1), amplitude];
							return next;
						});
					}

					animationFrameRef.current =
						requestAnimationFrame(updateVisualizer);
				}
			};

			updateVisualizer();

			// Setup MediaRecorder
			const mediaRecorder = new MediaRecorder(stream) as MediaRecorder & {
				role?: string;
			};
			const chunks: Blob[] = [];

			mediaRecorder.ondataavailable = (e) => {
				if (e.data.size > 0) chunks.push(e.data);
			};

			mediaRecorder.onstop = () => {
				if (mediaRecorder.role !== "discard") {
					const blob = new Blob(chunks, { type: "audio/webm" });
					setAudioBlob(blob);
				}
			};

			mediaRecorderRef.current = mediaRecorder;
			mediaRecorder.start();
			setIsRecording(true);
		} catch (err) {
			console.error("Failed to start recording", err);
		}
	}, []);

	const cleanup = useCallback(() => {
		if (animationFrameRef.current) {
			cancelAnimationFrame(animationFrameRef.current);
		}
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
		if (audioContextRef.current) {
			audioContextRef.current.close();
		}
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => track.stop());
		}
		setWaveform(new Array(40).fill(0));
	}, []);

	const stopRecording = useCallback(() => {
		const recorder = mediaRecorderRef.current as
			| (MediaRecorder & { role?: string })
			| null;
		if (recorder && isRecording) {
			recorder.role = "stop";
			recorder.stop();
			setIsRecording(false);
		}
		cleanup();
	}, [isRecording, cleanup]);

	const discardRecording = useCallback(() => {
		const recorder = mediaRecorderRef.current as
			| (MediaRecorder & { role?: string })
			| null;
		if (recorder && isRecording) {
			recorder.role = "discard";
			recorder.stop();
			setIsRecording(false);
			setAudioBlob(null);
		}
		cleanup();
	}, [isRecording, cleanup]);

	return {
		isRecording,
		audioBlob,
		waveform,
		duration,
		startRecording,
		stopRecording,
		discardRecording,
		setAudioBlob,
	};
};

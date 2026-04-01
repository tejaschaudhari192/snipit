import { useEffect, useState } from "react";
import icon from "@/assets/brand/icon.png";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const SplashPage = () => {
	const { t } = useTranslation();
	const [progress, setProgress] = useState(0);
	const [phraseIndex, setPhraseIndex] = useState(0);

	const phrases = t("splash.loading_phrases", {
		returnObjects: true,
	});

	const loadingPhrases = Array.isArray(phrases)
		? phrases
		: [
				"Initializing Core...",
				"Warming up engine...",
				"Loading syntax trees...",
				"Compiling workspace...",
				"Readying snippets...",
			];

	useEffect(() => {
		const timer = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 100) {
					clearInterval(timer);
					return 100;
				}
				return prev + 1.5;
			});
		}, 30);

		const phraseTimer = setInterval(() => {
			setPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
		}, 2000);

		return () => {
			clearInterval(timer);
			clearInterval(phraseTimer);
		};
	}, [loadingPhrases.length]);

	return (
		<div className="relative h-screen w-screen overflow-hidden bg-background text-foreground transition-colors duration-300 flex flex-col items-center justify-center pointer-events-none">
			<div className="relative z-10 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
				<div className="flex flex-col items-center justify-center mb-6">
					<div className="relative flex items-center justify-center w-32 h-32 mb-8">
						<img
							src={icon}
							alt="Snipit logo"
							className="relative z-10 h-20 w-20 drop-shadow-md transition-transform hover:scale-105 duration-300"
						/>
					</div>

					<h1 className="text-7xl tracking-tighter font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-foreground via-foreground to-muted-foreground pb-2">
						Snipit
					</h1>
				</div>

				<div className="w-72 flex flex-col gap-4 mt-8">
					<div className="flex w-full justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1 h-4">
						<span className="flex items-center gap-2">
							<Loader2 className="w-3.5 h-3.5 animate-spin" />
							<span className="animate-pulse">
								{loadingPhrases[phraseIndex]}
							</span>
						</span>
						<span className="tabular-nums">
							{Math.floor(progress)}%
						</span>
					</div>
					<div className="h-1 w-full bg-muted rounded-full overflow-hidden">
						<div
							className="h-full bg-primary rounded-full transition-all duration-75 ease-out"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SplashPage;

import { useEffect, useState } from "react";
import icon from "@/assets/brand/icon.png";
import { Loader2 } from "lucide-react";

const loadingPhrases = [
    "Starting up...",
    "Just a second...",
    "Almost ready...",
    "Getting things set...",
    "Finishing touches...",
];

const SplashPage = () => {
	const [progress, setProgress] = useState(0);
	const [phraseIndex, setPhraseIndex] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 100) {
					clearInterval(timer);
					return 100;
				}
				// Smoother, steady progress update
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
	}, []);

	return (
		<div className="relative h-screen w-screen overflow-hidden bg-background text-foreground transition-colors duration-300 flex flex-col items-center justify-center pointer-events-none selction:bg-transparent">
			{/* Ambient Background Glows */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] bg-primary/10 blur-[120px] rounded-full" />
			<div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full" />
			<div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full" />

			<div className="relative z-10 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-1000">
				{/* Logo section */}
				<div className="flex flex-col items-center justify-center mb-6">
					<div className="relative flex items-center justify-center w-32 h-32 mb-8">
						{/* Animated decorative rings */}
						<div className="absolute inset-1 rounded-full border border-primary/30 border-dashed animate-[spin_8s_linear_infinite]" />
						<div className="absolute inset-4 rounded-full border border-primary/20 animate-[spin_6s_linear_infinite_reverse]" />

						{/* Radiating ripple circles */}
						<div className="absolute inset-6 rounded-full bg-primary/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
						<div
							className="absolute inset-6 rounded-full bg-primary/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"
							style={{ animationDelay: "1.5s" }}
						/>

						<div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full animate-pulse" />

						<img
							src={icon}
							alt="Snipit logo"
							className="relative z-10 h-20 w-20 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-transform hover:scale-105 duration-300"
						/>
					</div>

					<h1 className="text-7xl tracking-tighter font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-foreground via-foreground to-muted-foreground drop-shadow-sm pb-2">
						Snipit
					</h1>
				</div>

				{/* Custom Loader Indicator */}
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
					<div className="h-1 w-full bg-muted rounded-full overflow-hidden backdrop-blur-md shadow-inner">
						<div
							className="h-full bg-gradient-to-r from-primary/60 via-primary to-primary-foreground rounded-full transition-all duration-75 ease-out relative"
							style={{ width: `${progress}%` }}
						>
							<div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-foreground/40 blur-[2px]" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SplashPage;

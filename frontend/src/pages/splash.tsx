import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import TextType from "@/components/TextType";
import { useTranslation } from "react-i18next";
import icon from "@/assets/brand/icon.png";

const SplashPage = () => {
	const { t } = useTranslation();
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 100) {
					clearInterval(timer);
					return 100;
				}
				return prev + 5;
			});
		}, 100);

		return () => clearInterval(timer);
	}, []);

	return (
		<div className="h-screen w-screen flex items-center justify-center bg-white">
			<div className="text-center animate-fade-in">
				<div className="flex items-center justify-center h-fit gap-2">
					<img src={icon} alt="Snipit icon" className="h-16" />
					<p className="text-6xl font-bold bg-clip-text transform transition-transform duration-300 ease-in-out group-hover:scale-105">
						Snipit
					</p>
				</div>

				<p className="text-xl text-muted-foreground mb-8">
					<TextType text={t("splash.tagline")} />
				</p>
				<Progress value={progress} className="w-64 mx-auto" />
			</div>
		</div>
	);
};

export default SplashPage;

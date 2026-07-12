import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Cloud, KeyRound } from "lucide-react";

interface Step1FeatureOverviewProps {
	onNext: () => void;
}

export default function Step1FeatureOverview({
	onNext,
}: Step1FeatureOverviewProps) {
	const { t } = useTranslation();

	return (
		<div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="text-center space-y-3 md:space-y-4">
				<div className="inline-flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-primary/10 mb-2 ring-8 ring-primary/5">
					<Shield className="h-8 w-8 md:h-10 md:w-10 text-primary" />
				</div>
				<h1 className="text-2xl md:text-3xl font-bold tracking-tight">
					{t("tools.password_manager_onboarding_title")}
				</h1>
				<p className="text-sm md:text-base text-muted-foreground max-w-sm mx-auto">
					{t("tools.password_manager_onboarding_subtitle")}
				</p>
			</div>

			<div className="grid gap-3 sm:grid-cols-3 max-w-4xl mx-auto">
				<Card className="bg-background/60 backdrop-blur-sm border-border/50">
					<CardContent className="p-4 flex sm:flex-col items-center sm:text-center text-left gap-4 sm:gap-2">
						<Lock className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
						<div>
							<h3 className="font-semibold text-sm">
								{t(
									"tools.password_manager_onboarding_feature_aes_title",
								)}
							</h3>
							<p className="text-xs text-muted-foreground mt-0.5 sm:mt-0">
								{t(
									"tools.password_manager_onboarding_feature_aes_desc",
								)}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="bg-background/60 backdrop-blur-sm border-border/50">
					<CardContent className="p-4 flex sm:flex-col items-center sm:text-center text-left gap-4 sm:gap-2">
						<KeyRound className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
						<div>
							<h3 className="font-semibold text-sm">
								{t(
									"tools.password_manager_onboarding_feature_zero_title",
								)}
							</h3>
							<p className="text-xs text-muted-foreground mt-0.5 sm:mt-0">
								{t(
									"tools.password_manager_onboarding_feature_zero_desc",
								)}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="bg-background/60 backdrop-blur-sm border-border/50">
					<CardContent className="p-4 flex sm:flex-col items-center sm:text-center text-left gap-4 sm:gap-2">
						<Cloud className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
						<div>
							<h3 className="font-semibold text-sm">
								{t(
									"tools.password_manager_onboarding_feature_sync_title",
								)}
							</h3>
							<p className="text-xs text-muted-foreground mt-0.5 sm:mt-0">
								{t(
									"tools.password_manager_onboarding_feature_sync_desc",
								)}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="flex justify-center pt-4">
				<Button
					onClick={onNext}
					size="lg"
					className="rounded-full px-8"
				>
					{t("tools.password_manager_onboarding_cta")}{" "}
					<span className="ml-2">→</span>
				</Button>
			</div>
		</div>
	);
}

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Shield, Lock, Unlock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CryptoPanel } from "@/tools/cryptsafe/components/crypto-panel";

const EncryptSafePage = () => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const tabFromUrl = searchParams.get("tab") as "encrypt" | "decrypt" | null;
	const [activeTab, setActiveTab] = useState<"encrypt" | "decrypt">(
		tabFromUrl || "encrypt",
	);

	useEffect(() => {
		if (tabFromUrl && tabFromUrl !== activeTab) {
			setActiveTab(tabFromUrl);
		}
	}, [tabFromUrl, activeTab]);

	return (
		<div className="min-h-full bg-background text-foreground transition-colors duration-300">
			<section className="relative pt-4 pb-2 md:pt-6 md:pb-4 px-4 overflow-hidden">
				<div className="max-w-3xl mx-auto text-center relative z-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
					<div className="flex flex-col items-center justify-center w-full">
						<div className="glow-badge mb-2">
							<Shield className="w-3.5 h-3.5 fill-current" />
							{t("tools.badge")}
						</div>
						<h1 className="text-2xl sm:text-3xl font-black mb-1.5 tracking-tight leading-tight bg-clip-text text-transparent bg-linear-to-r from-foreground via-foreground/95 to-foreground/80">
							{t("tools.cryptoSafe_title")}
						</h1>
						<p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
							{t("tools.subtitle")}
						</p>
					</div>
				</div>
			</section>

			<section className="pb-8 px-4 md:px-8 max-w-xl mx-auto">
				<Tabs
					value={activeTab}
					onValueChange={(v) =>
						setActiveTab(v as "encrypt" | "decrypt")
					}
					className="w-full flex-col"
				>
					<TabsList className="grid grid-cols-2 w-full mb-5 h-10 p-1 rounded-xl bg-muted/60 border border-border/40">
						<TabsTrigger
							value="encrypt"
							className="flex items-center justify-center gap-2 h-full rounded-lg text-xs font-semibold cursor-pointer data-active:bg-background data-active:text-foreground data-active:shadow-xs transition-all"
						>
							<Lock className="h-3.5 w-3.5" />
							{t("tools.encrypt_tab")}
						</TabsTrigger>
						<TabsTrigger
							value="decrypt"
							className="flex items-center justify-center gap-2 h-full rounded-lg text-xs font-semibold cursor-pointer data-active:bg-background data-active:text-foreground data-active:shadow-xs transition-all"
						>
							<Unlock className="h-3.5 w-3.5" />
							{t("tools.decrypt_tab")}
						</TabsTrigger>
					</TabsList>

					<TabsContent value="encrypt" className="outline-none mt-0">
						<CryptoPanel mode="encrypt" />
					</TabsContent>

					<TabsContent value="decrypt" className="outline-none mt-0">
						<CryptoPanel mode="decrypt" />
					</TabsContent>
				</Tabs>
			</section>
		</div>
	);
};

export default EncryptSafePage;

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Shield, Lock, Unlock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CryptoPanel } from "@/tools/cryptsafe/components/crypto-panel";

const EncryptSafePage = () => {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState<"encrypt" | "decrypt">(
		"encrypt",
	);

	return (
		<div className="min-h-full bg-background text-foreground transition-colors duration-300">
			<section className="relative py-12 md:py-16 px-4 overflow-hidden">
				<div className="max-w-4xl mx-auto text-center relative z-10 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
					<div className="flex flex-col items-center justify-center w-full">
						<div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary dark:bg-primary/20 text-xs md:text-sm font-bold mb-6 ring-1 ring-primary/20 backdrop-blur-sm shadow-lg shadow-primary/5">
							<Shield className="w-4 h-4 fill-current" />
							{t("tools.badge")}
						</div>
						<h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tighter leading-[1.1] bg-clip-text text-transparent bg-linear-to-r from-foreground via-foreground/95 to-foreground/80">
							{t("tools.cryptoSafe_title")}
						</h1>
						<p className="text-base md:text-lg text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
							{t("tools.subtitle")}
						</p>
					</div>
				</div>
			</section>

			<section className="pb-16 px-4 md:px-8 max-w-2xl mx-auto">
				<Tabs
					value={activeTab}
					onValueChange={(v) =>
						setActiveTab(v as "encrypt" | "decrypt")
					}
					className="w-full"
				>
					<TabsList className="grid grid-cols-2 w-full mb-8 bg-muted/50 p-1 rounded-xl h-auto">
						<TabsTrigger
							value="encrypt"
							className="flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all"
						>
							<Lock className="h-4 w-4" />
							{t("tools.encrypt_tab")}
						</TabsTrigger>
						<TabsTrigger
							value="decrypt"
							className="flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all"
						>
							<Unlock className="h-4 w-4" />
							{t("tools.decrypt_tab")}
						</TabsTrigger>
					</TabsList>

					<TabsContent value="encrypt" className="outline-none">
						<CryptoPanel mode="encrypt" />
					</TabsContent>

					<TabsContent value="decrypt" className="outline-none">
						<CryptoPanel mode="decrypt" />
					</TabsContent>
				</Tabs>
			</section>
		</div>
	);
};

export default EncryptSafePage;

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Home, Plus, FileQuestion } from "lucide-react";

const Error = () => {
	const { t } = useTranslation();

	return (
		<div className="min-h-[90vh] flex items-center justify-center px-4 bg-gradient-to-br from-background via-muted/10 to-background">
			<div className="max-w-2xl w-full text-center">
				{/* Animated 404 */}
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
					className="relative mb-8"
				>
					{/* Background glow effect */}
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
					</div>

					{/* 404 Text */}
					<div className="relative">
						<h1 className="text-[150px] md:text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-b from-primary via-primary/70 to-primary/20 leading-none select-none">
							404
						</h1>
					</div>
				</motion.div>

				{/* Icon */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="mb-6"
				>
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted">
						<FileQuestion className="w-8 h-8 text-muted-foreground" />
					</div>
				</motion.div>

				{/* Text content */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}
					className="space-y-4 mb-10"
				>
					<h2 className="text-2xl md:text-3xl font-bold text-foreground">
						{t("error_page.title")}
					</h2>
					<p className="text-lg text-muted-foreground max-w-md mx-auto">
						{t("error_page.subtitle")}
					</p>
					<p className="text-sm text-muted-foreground/70 max-w-sm mx-auto">
						{t("error_page.description")}
					</p>
				</motion.div>

				{/* Action buttons */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}
					className="flex flex-col sm:flex-row gap-4 justify-center"
				>
					<Link to="/">
						<Button
							size="lg"
							className="gap-2 px-8 w-full sm:w-auto"
						>
							<Home className="w-4 h-4" />
							{t("error_page.go_home")}
						</Button>
					</Link>
					<Link to="/">
						<Button
							size="lg"
							variant="outline"
							className="gap-2 px-8 w-full sm:w-auto"
						>
							<Plus className="w-4 h-4" />
							{t("error_page.create_new")}
						</Button>
					</Link>
				</motion.div>

				{/* Decorative elements */}
				<div className="absolute top-1/4 left-10 w-2 h-2 rounded-full bg-primary/30 animate-pulse" />
				<div className="absolute top-1/3 right-16 w-3 h-3 rounded-full bg-primary/20 animate-pulse delay-150" />
				<div className="absolute bottom-1/4 left-20 w-2 h-2 rounded-full bg-primary/25 animate-pulse delay-300" />
				<div className="absolute bottom-1/3 right-10 w-2 h-2 rounded-full bg-primary/30 animate-pulse delay-500" />
			</div>
		</div>
	);
};

export default Error;

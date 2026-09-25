"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "cn";
import { Wifi, Eye, EyeOff, Copy, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChipSVG, CardNetworkLogo } from "./card-visuals";

export interface CreditCardPreviewProps {
	cardholderName?: string;
	cardNumber?: string;
	expiration?: string;
	cvv?: string;
	bankName?: string;
	className?: string;
	isFlipped?: boolean;
	onFlipChange?: (flipped: boolean) => void;
	defaultShowSensitives?: boolean;
}

export function CreditCardPreview({
	cardholderName,
	cardNumber,
	expiration,
	cvv,
	bankName,
	className,
	isFlipped: controlledFlipped,
	onFlipChange,
	defaultShowSensitives = false,
}: CreditCardPreviewProps) {
	const { t } = useTranslation();
	const [internalFlipped, setInternalFlipped] = useState(false);
	const [showSensitives, setShowSensitives] = useState(defaultShowSensitives);
	const [copied, setCopied] = useState(false);

	const isFlipped =
		controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

	const handleFlipToggle = () => {
		const next = !isFlipped;
		if (onFlipChange) {
			onFlipChange(next);
		}
		if (controlledFlipped === undefined) {
			setInternalFlipped(next);
		}
	};

	const cleanNumber = (cardNumber || "").replace(/\s+/g, "");
	const formattedNumber = cleanNumber
		? cleanNumber.replace(/(\d{4})/g, "$1 ").trim()
		: "•••• •••• •••• ••••";

	const maskedNumber =
		cleanNumber.length >= 8
			? `${cleanNumber.slice(0, 4)} •••• •••• ${cleanNumber.slice(-4)}`
			: formattedNumber;

	const handleCopyNumber = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (cleanNumber) {
			navigator.clipboard.writeText(cleanNumber);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	return (
		<div
			className={cn("flex flex-col gap-2 items-center w-full", className)}
		>
			{/* 3D flip container */}
			<div
				className="relative w-full max-w-sm h-56 cursor-pointer select-none"
				style={{ perspective: "1200px" }}
				onClick={handleFlipToggle}
				role="button"
				aria-label={
					isFlipped
						? t("tools.password_manager.card_preview.card_front")
						: t("tools.password_manager.card_preview.card_back")
				}
			>
				<div
					className="relative w-full h-full transition-transform duration-700 ease-in-out"
					style={{
						transformStyle: "preserve-3d",
						transform: isFlipped
							? "rotateY(180deg)"
							: "rotateY(0deg)",
					}}
				>
					{/* ── FRONT ── */}
					<Card
						className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border-0 bg-transparent p-6"
						style={{ backfaceVisibility: "hidden" }}
					>
						<div className="absolute inset-0 bg-linear-to-br from-blue-600 via-sky-500 to-teal-400" />
						<div className="absolute inset-0 bg-black/30" />
						<div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-white/10 blur-md" />
						<div className="absolute -bottom-20 -left-14 w-64 h-64 rounded-full bg-white/5 blur-md" />

						<CardContent className="relative z-10 flex flex-col justify-between h-full p-0">
							{/* Row 1: bank name | show/hide toggle */}
							<div className="flex items-start justify-between">
								<span className="text-white font-bold text-lg tracking-wider uppercase drop-shadow-sm">
									{bankName ||
										t(
											"tools.password_manager.card_preview.default_bank",
										)}
								</span>
								<div className="flex items-center gap-1.5">
									{cleanNumber && (
										<Button
											variant="ghost"
											size="icon"
											onClick={handleCopyNumber}
											className="h-7 w-7 text-white/80 hover:text-white hover:bg-black/30! transition-colors rounded-full cursor-pointer"
											title={
												copied
													? t(
															"tools.password_manager.card_preview.copied",
														)
													: t(
															"tools.password_manager.card_preview.copy_number",
														)
											}
										>
											{copied ? (
												<Check className="w-3.5 h-3.5 text-emerald-300" />
											) : (
												<Copy className="w-3.5 h-3.5" />
											)}
										</Button>
									)}
									<Button
										variant="ghost"
										size="icon"
										onClick={(e) => {
											e.stopPropagation();
											setShowSensitives((s) => !s);
										}}
										className="h-7 w-7 text-white/80 hover:text-white hover:bg-black/30! transition-colors rounded-full cursor-pointer"
										aria-label={
											showSensitives
												? t(
														"tools.password_manager.card_preview.mask_details",
													)
												: t(
														"tools.password_manager.card_preview.show_details",
													)
										}
										title={
											showSensitives
												? t(
														"tools.password_manager.card_preview.mask_details",
													)
												: t(
														"tools.password_manager.card_preview.show_details",
													)
										}
									>
										{showSensitives ? (
											<EyeOff className="w-3.5 h-3.5" />
										) : (
											<Eye className="w-3.5 h-3.5" />
										)}
									</Button>
								</div>
							</div>

							{/* Row 2: chip + NFC */}
							<div className="flex items-center justify-between">
								<ChipSVG />
								<Wifi className="text-white/80 w-5 h-5 rotate-90" />
							</div>

							{/* Row 3: card number */}
							<p className="font-mono text-white text-base tracking-widest select-none drop-shadow-sm">
								{showSensitives
									? formattedNumber
									: maskedNumber}
							</p>

							{/* Row 4: holder | expiry | network */}
							<div className="flex items-end justify-between">
								<div className="min-w-0 max-w-[50%]">
									<p className="text-white/70 text-[10px] uppercase tracking-wider">
										{t(
											"tools.password_manager.card_preview.card_holder",
										)}
									</p>
									<p className="text-white text-sm font-semibold tracking-wider mt-0.5 uppercase truncate drop-shadow-sm font-mono">
										{cardholderName ||
											t(
												"tools.password_manager.card_preview.default_holder",
											)}
									</p>
								</div>
								<div>
									<p className="text-white/70 text-[10px] uppercase tracking-wider">
										{t(
											"tools.password_manager.card_preview.expires",
										)}
									</p>
									<p className="text-white text-sm font-semibold tracking-widest mt-0.5 drop-shadow-sm font-mono">
										{expiration || "MM/YY"}
									</p>
								</div>
								<CardNetworkLogo cardNumber={cleanNumber} />
							</div>
						</CardContent>
					</Card>

					{/* ── BACK ── */}
					<Card
						className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border-0 bg-transparent p-0 py-4"
						style={{
							backfaceVisibility: "hidden",
							transform: "rotateY(180deg)",
						}}
					>
						<div className="absolute inset-0 bg-linear-to-br from-blue-600 via-sky-500 to-teal-400" />
						<div className="absolute inset-0 bg-black/30" />

						<div className="relative z-10 flex flex-col gap-4 h-full">
							<div className="w-full h-10 bg-black/80" />

							<CardContent className="p-0 px-6 flex flex-col gap-3">
								<div className="flex items-end gap-3">
									<div className="flex-1 h-8 bg-white/90 rounded-sm flex items-center overflow-hidden">
										{Array.from({ length: 24 }).map(
											(_, i) => (
												<div
													key={i}
													className={cn(
														"flex-1 h-full",
														i % 2 === 0
															? "bg-slate-300/70"
															: "bg-white/80",
													)}
												/>
											),
										)}
									</div>
									<div className="flex flex-col items-center gap-0.5 shrink-0">
										<span className="text-white/70 text-[10px] uppercase tracking-widest">
											{t(
												"tools.password_manager.card_preview.cvv",
											)}
										</span>
										<div className="bg-white text-slate-900 font-mono font-bold text-sm px-3 py-1 rounded-sm w-12 text-center select-none shadow-inner">
											{showSensitives
												? cvv || "•••"
												: "•••"}
										</div>
									</div>
								</div>
								<div>
									<p className="text-white/60 text-[11px] leading-relaxed">
										{t(
											"tools.password_manager.card_preview.disclaimer",
										)}
									</p>
								</div>
							</CardContent>
						</div>
					</Card>
				</div>
			</div>
			<p className="text-[11px] text-muted-foreground">
				{t("tools.password_manager.card_preview.click_to_flip")}
			</p>
		</div>
	);
}

export default CreditCardPreview;

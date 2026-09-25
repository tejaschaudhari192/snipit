"use client";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CreditCardPreview } from "../detail-fields/credit-card-preview";

interface CreditCardFormEditorProps {
	metadata: Record<string, string>;
	updateMetadata: (key: string, value: string) => void;
	bankName?: string;
}

const MONTHS = [
	{ value: "01", label: "01" },
	{ value: "02", label: "02" },
	{ value: "03", label: "03" },
	{ value: "04", label: "04" },
	{ value: "05", label: "05" },
	{ value: "06", label: "06" },
	{ value: "07", label: "07" },
	{ value: "08", label: "08" },
	{ value: "09", label: "09" },
	{ value: "10", label: "10" },
	{ value: "11", label: "11" },
	{ value: "12", label: "12" },
];

export function CreditCardFormEditor({
	metadata,
	updateMetadata,
	bankName,
}: CreditCardFormEditorProps) {
	const { t } = useTranslation();
	const [isFlipped, setIsFlipped] = React.useState(false);

	const cardholderName = metadata.cardholderName || "";
	const cardNumber = metadata.cardNumber || "";
	const expiration = metadata.expiration || "";
	const cvv = metadata.cvv || "";
	const pin = metadata.pin || "";
	const zipCode = metadata.zipCode || "";

	// Parse MM/YY or MM/YYYY from expiration string
	const { currentMonth, currentYear } = useMemo(() => {
		if (!expiration) return { currentMonth: "", currentYear: "" };
		const parts = expiration.split("/").map((p) => p.trim());
		const mm = parts[0] || "";
		let yy = parts[1] || "";
		if (yy.length === 2) yy = `20${yy}`;
		return { currentMonth: mm, currentYear: yy };
	}, [expiration]);

	// Generate 15 years from current year
	const years = useMemo(() => {
		const startYear = new Date().getFullYear();
		return Array.from({ length: 15 }, (_, i) => String(startYear + i));
	}, []);

	// Format card number with spaces as user types
	const handleCardNumberChange = (raw: string) => {
		const digits = raw.replace(/\D/g, "").slice(0, 19);
		const formatted = digits.replace(/(\d{4})/g, "$1 ").trim();
		updateMetadata("cardNumber", formatted);
	};

	const handleMonthChange = (month: string | null) => {
		const mm = month || "";
		const yyShort = currentYear ? currentYear.slice(-2) : "";
		const newExp = mm && yyShort ? `${mm}/${yyShort}` : mm || "";
		updateMetadata("expiration", newExp);
	};

	const handleYearChange = (year: string | null) => {
		const yyFull = year || "";
		const yyShort = yyFull.slice(-2);
		const mm = currentMonth || "MM";
		const newExp = mm && yyShort ? `${mm}/${yyShort}` : "";
		updateMetadata("expiration", newExp);
	};

	return (
		<div className="space-y-6">
			{/* Dynamic Preview Above */}
			<div className="flex justify-center pt-1 pb-3">
				<CreditCardPreview
					cardholderName={cardholderName}
					cardNumber={cardNumber}
					expiration={expiration}
					cvv={cvv}
					bankName={bankName}
					isFlipped={isFlipped}
					onFlipChange={setIsFlipped}
					defaultShowSensitives={true}
				/>
			</div>

			{/* Form Fields Below */}
			<div className="space-y-4">
				{/* Cardholder Name */}
				<div className="space-y-1.5">
					<Label className="text-xs text-muted-foreground">
						{t("tools.password_manager.fields.cardholder_name")}
					</Label>
					<Input
						type="text"
						value={cardholderName}
						onFocus={() => setIsFlipped(false)}
						onChange={(e) =>
							updateMetadata("cardholderName", e.target.value)
						}
						placeholder="John Doe"
						autoComplete="off"
						className="bg-background rounded-xl border border-border"
					/>
				</div>

				{/* Card Number */}
				<div className="space-y-1.5">
					<Label className="text-xs text-muted-foreground">
						{t("tools.password_manager.fields.card_number")}
					</Label>
					<Input
						type="text"
						inputMode="numeric"
						value={cardNumber}
						onFocus={() => setIsFlipped(false)}
						onChange={(e) => handleCardNumberChange(e.target.value)}
						placeholder="1234 5678 9012 3456"
						autoComplete="off"
						className="bg-background rounded-xl border border-border font-mono tracking-wider"
					/>
				</div>

				{/* Month, Year, CVC Row */}
				<div className="grid grid-cols-3 gap-3">
					{/* Month */}
					<div className="space-y-1.5">
						<Label className="text-xs text-muted-foreground">
							Month
						</Label>
						<Select
							value={currentMonth || undefined}
							onValueChange={handleMonthChange}
						>
							<SelectTrigger className="w-full bg-background border-border rounded-xl font-mono">
								<SelectValue placeholder="MM" />
							</SelectTrigger>
							<SelectContent>
								{MONTHS.map((m) => (
									<SelectItem key={m.value} value={m.value}>
										{m.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Year */}
					<div className="space-y-1.5">
						<Label className="text-xs text-muted-foreground">
							Year
						</Label>
						<Select
							value={currentYear || undefined}
							onValueChange={handleYearChange}
						>
							<SelectTrigger className="w-full bg-background border-border rounded-xl font-mono">
								<SelectValue placeholder="YYYY" />
							</SelectTrigger>
							<SelectContent>
								{years.map((y) => (
									<SelectItem key={y} value={y}>
										{y}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* CVC / CVV */}
					<div className="space-y-1.5">
						<Label className="text-xs text-muted-foreground">
							{t("tools.password_manager.fields.cvv")}
						</Label>
						<Input
							type="password"
							inputMode="numeric"
							maxLength={4}
							value={cvv}
							onFocus={() => setIsFlipped(true)}
							onChange={(e) =>
								updateMetadata(
									"cvv",
									e.target.value
										.replace(/\D/g, "")
										.slice(0, 4),
								)
							}
							placeholder="123"
							autoComplete="off"
							className="bg-background rounded-xl border border-border font-mono text-center"
						/>
					</div>
				</div>

				{/* Optional PIN & Zip Code */}
				<div className="grid grid-cols-2 gap-3 pt-1">
					<div className="space-y-1.5">
						<Label className="text-xs text-muted-foreground">
							{t("tools.password_manager.fields.pin")}
						</Label>
						<Input
							type="password"
							inputMode="numeric"
							maxLength={6}
							value={pin}
							onFocus={() => setIsFlipped(false)}
							onChange={(e) =>
								updateMetadata(
									"pin",
									e.target.value
										.replace(/\D/g, "")
										.slice(0, 6),
								)
							}
							placeholder="••••"
							autoComplete="off"
							className="bg-background rounded-xl border border-border font-mono"
						/>
					</div>

					<div className="space-y-1.5">
						<Label className="text-xs text-muted-foreground">
							{t("tools.password_manager.fields.zip_code")}
						</Label>
						<Input
							type="text"
							value={zipCode}
							onFocus={() => setIsFlipped(false)}
							onChange={(e) =>
								updateMetadata("zipCode", e.target.value)
							}
							placeholder="Zip / Postal Code"
							autoComplete="off"
							className="bg-background rounded-xl border border-border"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

export default CreditCardFormEditor;

import { useState, useCallback, useEffect } from "react";
import { generate } from "generate-password-ts";
import zxcvbn from "zxcvbn";
import diceware from "diceware-generator";
import enWordlist from "diceware-wordlist-en";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Copy, RefreshCw, X, MoreVertical } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface PasswordGeneratorProps {
	onGenerate?: (password: string) => void;
	onClose?: () => void;
}

const getStrengthLabel = (score: number) => {
	switch (score) {
		case 0:
			return "tools.password_generator_strength_risky";
		case 1:
			return "tools.password_generator_strength_weak";
		case 2:
			return "tools.password_generator_strength_fair";
		case 3:
			return "tools.password_generator_strength_strong";
		case 4:
			return "tools.password_generator_strength_secure";
		default:
			return "tools.password_generator_strength_unknown";
	}
};

export default function PasswordGenerator({
	onGenerate,
	onClose,
}: PasswordGeneratorProps) {
	const { t } = useTranslation();
	const [length, setLength] = useState(15);
	const [wordCount, setWordCount] = useState(2);
	const [pronounceable, setPronounceable] = useState(true);

	const [useUpper, setUseUpper] = useState(false);
	const [useNumbers, setUseNumbers] = useState(false);
	const [separator, setSeparator] = useState("hash");

	const [password, setPassword] = useState("");
	const [strengthScore, setStrengthScore] = useState(0);
	const [feedback, setFeedback] = useState("");
	const [copied, setCopied] = useState(false);

	const getSeparatorChar = (sep: string) => {
		switch (sep) {
			case "hash":
				return "#";
			case "hyphen":
				return "-";
			case "space":
				return " ";
			case "comma":
				return ",";
			default:
				return "";
		}
	};

	const generatePassword = useCallback(() => {
		let newPassword = "";

		if (pronounceable) {
			// Advanced, secure Passphrase Generation using diceware
			const options = {
				language: enWordlist,
				wordcount: wordCount,
				format: separator === "none" ? "array" : "array",
			};
			const phraseArray = diceware(options);
			const phrase = Array.isArray(phraseArray)
				? phraseArray.join(" ")
				: phraseArray;

			if (useUpper || useNumbers) {
				const words = phrase.split(getSeparatorChar(separator) || " ");
				if (useUpper) {
					for (let i = 0; i < words.length; i++) {
						words[i] =
							words[i].charAt(0).toUpperCase() +
							words[i].slice(1);
					}
				}
				if (useNumbers) {
					const num = new Uint32Array(1);
					window.crypto.getRandomValues(num);
					words[words.length - 1] += (num[0] % 100).toString();
				}
				newPassword = words.join(getSeparatorChar(separator) || "");
			} else {
				newPassword = phrase;
			}
		} else {
			// Secure Random Character Generation
			newPassword = generate({
				length: length,
				numbers: useNumbers,
				symbols: true,
				uppercase: useUpper,
				lowercase: true,
				strict: true,
			});
		}

		const evaluation = zxcvbn(newPassword);
		setPassword(newPassword);
		setStrengthScore(evaluation.score);
		setFeedback(evaluation.feedback.warning || "");
		setCopied(false);
	}, [length, wordCount, pronounceable, useUpper, useNumbers, separator]);

	// Generate on initial load or settings change
	useEffect(() => {
		generatePassword();
	}, [generatePassword]);

	const handleCopy = async () => {
		if (!password) return;
		await navigator.clipboard.writeText(password);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleFill = () => {
		if (password && onGenerate) {
			onGenerate(password);
		}
	};

	return (
		<div className="w-full bg-background rounded-t-xl overflow-hidden flex flex-col">
			{/* Header section inspired by the red theme */}
			<div className="bg-[#da1111] text-white p-4">
				<div className="flex items-center justify-between mb-8">
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="h-8 w-8 hover:bg-black/10 hover:text-white rounded-full transition-colors"
					>
						<X className="h-5 w-5" />
					</Button>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							onClick={generatePassword}
							className="h-8 w-8 hover:bg-black/10 hover:text-white rounded-full transition-colors"
						>
							<RefreshCw className="h-5 w-5" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={handleCopy}
							className="h-8 w-8 hover:bg-black/10 hover:text-white rounded-full transition-colors relative"
						>
							<Copy className="h-5 w-5" />
							{copied && (
								<span className="absolute -top-8 -left-4 bg-black/80 text-xs px-2 py-1 rounded text-white whitespace-nowrap">
									{t(
										"tools.password_generator_copied",
										"Copied!",
									)}
								</span>
							)}
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 hover:bg-black/10 hover:text-white rounded-full transition-colors"
						>
							<MoreVertical className="h-5 w-5" />
						</Button>
					</div>
				</div>

				<div className="text-center font-mono text-2xl tracking-wider min-h-[40px] flex items-center justify-center break-all px-4">
					{password}
				</div>
			</div>

			{/* Strength & Fill Bar */}
			<div className="bg-[#b30e0e] text-white px-4 py-3 flex flex-col gap-1 border-t border-white/10">
				<div className="flex items-center justify-between">
					<span className="font-bold text-sm tracking-wide">
						{t(getStrengthLabel(strengthScore))}
					</span>
					<Button
						variant="outline"
						className="bg-transparent text-white border-white hover:bg-white hover:text-[#b30e0e] h-8 px-6 rounded-full font-medium"
						onClick={handleFill}
					>
						{t("tools.password_generator_fill", "Fill")}
					</Button>
				</div>
				{feedback && (
					<span className="text-xs text-white/80 italic">
						{feedback}
					</span>
				)}
			</div>

			{/* Settings section */}
			<div className="p-4 space-y-6 bg-card text-card-foreground flex-1 overflow-y-auto max-h-[60vh]">
				{/* Sliders */}
				{pronounceable ? (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex flex-col">
								<span className="text-sm font-medium">
									{t(
										"tools.password_generator_words",
										"Words",
									)}
								</span>
								<span className="text-xs text-muted-foreground">
									(
									{t(
										"tools.password_generator_length",
										"Length",
									)}{" "}
									- {password.length})
								</span>
							</div>
							<div className="flex items-center gap-4">
								<input
									type="range"
									min={2}
									max={10}
									value={wordCount}
									onChange={(e) =>
										setWordCount(Number(e.target.value))
									}
									className="w-32 accent-primary"
								/>
								<span className="w-4 text-right text-sm">
									{wordCount}
								</span>
							</div>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">
								{t("tools.password_generator_length", "Length")}
							</span>
							<div className="flex items-center gap-4">
								<input
									type="range"
									min={8}
									max={64}
									value={length}
									onChange={(e) =>
										setLength(Number(e.target.value))
									}
									className="w-32 accent-primary"
								/>
								<span className="w-4 text-right text-sm">
									{length}
								</span>
							</div>
						</div>
					</div>
				)}

				<div className="h-px bg-border" />

				<div className="flex items-center justify-between">
					<span className="text-sm font-medium">
						{t(
							"tools.password_generator_pronounceable",
							"Pronounceable",
						)}
					</span>
					<Switch
						checked={pronounceable}
						onCheckedChange={setPronounceable}
						className="data-[state=checked]:bg-blue-500"
					/>
				</div>

				<div className="h-px bg-border" />

				<div className="space-y-4">
					<h4 className="text-sm font-bold">
						{t("tools.password_generator_include", "Include")}
					</h4>

					<div className="flex items-center justify-between">
						<span className="text-sm">
							{t(
								"tools.password_generator_uppercase",
								"Uppercase",
							)}
						</span>
						<Switch
							checked={useUpper}
							onCheckedChange={setUseUpper}
						/>
					</div>

					<div className="flex items-center justify-between">
						<span className="text-sm">
							{t("tools.password_generator_digits", "Digits")}
						</span>
						<Switch
							checked={useNumbers}
							onCheckedChange={setUseNumbers}
						/>
					</div>
				</div>

				{pronounceable && (
					<>
						<div className="h-px bg-border" />
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">
								{t(
									"tools.password_generator_separated_by",
									"Separated By",
								)}
							</span>
							<Select
								value={separator}
								onValueChange={setSeparator}
							>
								<SelectTrigger className="w-32 h-8">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">
										{t(
											"tools.password_generator_sep_none",
											"None",
										)}
									</SelectItem>
									<SelectItem value="hash">
										{t(
											"tools.password_generator_sep_hash",
											"Hash (#)",
										)}
									</SelectItem>
									<SelectItem value="hyphen">
										{t(
											"tools.password_generator_sep_hyphen",
											"Hyphen (-)",
										)}
									</SelectItem>
									<SelectItem value="space">
										{t(
											"tools.password_generator_sep_space",
											"Space",
										)}
									</SelectItem>
									<SelectItem value="comma">
										{t(
											"tools.password_generator_sep_comma",
											"Comma (,)",
										)}
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

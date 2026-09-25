export const ChipSVG = () => (
	<svg
		width="44"
		height="34"
		viewBox="0 0 44 34"
		fill="none"
		aria-hidden="true"
	>
		<rect width="44" height="34" rx="5" fill="#C9963A" />
		<rect x="14" width="16" height="34" fill="#B8852A" />
		<rect y="11" width="44" height="12" fill="#B8852A" />
		<rect x="14" y="11" width="16" height="12" fill="#E0B060" />
		<line
			x1="14"
			y1="0"
			x2="14"
			y2="11"
			stroke="#9A6E1A"
			strokeWidth="0.6"
		/>
		<line
			x1="30"
			y1="0"
			x2="30"
			y2="11"
			stroke="#9A6E1A"
			strokeWidth="0.6"
		/>
		<line
			x1="14"
			y1="23"
			x2="14"
			y2="34"
			stroke="#9A6E1A"
			strokeWidth="0.6"
		/>
		<line
			x1="30"
			y1="23"
			x2="30"
			y2="34"
			stroke="#9A6E1A"
			strokeWidth="0.6"
		/>
		<line
			x1="0"
			y1="11"
			x2="14"
			y2="11"
			stroke="#9A6E1A"
			strokeWidth="0.6"
		/>
		<line
			x1="0"
			y1="23"
			x2="14"
			y2="23"
			stroke="#9A6E1A"
			strokeWidth="0.6"
		/>
		<line
			x1="30"
			y1="11"
			x2="44"
			y2="11"
			stroke="#9A6E1A"
			strokeWidth="0.6"
		/>
		<line
			x1="30"
			y1="23"
			x2="44"
			y2="23"
			stroke="#9A6E1A"
			strokeWidth="0.6"
		/>
	</svg>
);

export const CardNetworkLogo = ({
	cardNumber = "",
}: {
	cardNumber?: string;
}) => {
	const clean = cardNumber.replace(/\s+/g, "");
	const isVisa = clean.startsWith("4");
	const isAmex = clean.startsWith("34") || clean.startsWith("37");

	if (isVisa) {
		return (
			<span className="text-white font-black italic tracking-widest text-lg font-serif">
				VISA
			</span>
		);
	}

	if (isAmex) {
		return (
			<span className="text-white font-extrabold tracking-tighter text-xs border border-white/60 px-1.5 py-0.5 rounded">
				AMEX
			</span>
		);
	}

	// Default Mastercard logo
	return (
		<div className="flex items-center" aria-label="Mastercard">
			<div className="w-7 h-7 rounded-full bg-red-500/90" />
			<div className="w-7 h-7 rounded-full bg-amber-400/90 -ml-3" />
		</div>
	);
};

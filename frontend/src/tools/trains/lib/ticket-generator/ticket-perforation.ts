/**
 * Generates the vertical perforated tear strip separating the main ticket body and the stub,
 * with authentic punch-hole dots.
 */
export const buildTicketPerforationHtml = (): string => {
	const punchHoles = Array.from({ length: 14 })
		.map(
			() =>
				`<div style="width: 6px; height: 6px; border-radius: 50%; background: #ffffff; opacity: 0.9; margin: 4px 0; box-shadow: inset 0 1px 2px rgba(0,0,0,0.3);"></div>`,
		)
		.join("");

	return `
		<div style="position: relative; width: 16px; background: #0f172a; display: flex; flex-direction: column; align-items: center; justify-content: space-evenly; height: 100%; padding: 16px 0; flex-shrink: 0; box-sizing: border-box;">
			${punchHoles}
		</div>
	`;
};

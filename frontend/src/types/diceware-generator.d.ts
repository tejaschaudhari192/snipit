declare module "diceware-generator" {
	interface DicewareOptions {
		language?: string | Record<string, string> | unknown;
		wordcount?: number;
		format?: string;
	}

	function diceware(options?: DicewareOptions): string | string[];
	export = diceware;
}

declare module "diceware-wordlist-en" {
	const content: Record<string, string>;
	export default content;
}

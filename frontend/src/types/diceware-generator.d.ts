declare module "diceware-generator" {
	interface DicewareOptions {
		language?: string;
		wordcount?: number;
		format?: string;
	}

	function diceware(options?: DicewareOptions): string;
	export = diceware;
}

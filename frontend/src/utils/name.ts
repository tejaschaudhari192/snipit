import { ADJECTIVES, ANIMALS } from "@/constants";

/**
 * Generates a random anonymous name (e.g., "Secret Panda")
 */
export function generateAnonymousName(): string {
	const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
	const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
	return `${adj} ${animal}`;
}

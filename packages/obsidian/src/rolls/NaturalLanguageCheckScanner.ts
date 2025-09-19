import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import type { InlineCheck } from 'packages/obsidian/src/rolls/InlineCheck';
import {
	PF1E_NATURAL_LANGUAGE_PARSER,
	Pf1eMiscSkills,
	Pf1eSkills,
	PF2E_NATURAL_LANGUAGE_PARSER,
	Pf2eMiscSkills,
	Pf2eSkills,
} from 'packages/obsidian/src/rolls/NaturalLanguageCheck';
import { Trie } from 'packages/obsidian/src/utils/Trie';

/**
 * Represents the result of finding a natural language check in text
 */
export interface CheckScanResult {
	/** The parsed check object */
	check: InlineCheck;
	/** The original text that was matched */
	text: string;
	/** Starting index of the match in the original input */
	startIndex: number;
	/** Ending index of the match in the original input (exclusive) */
	endIndex: number;
}

/**
 * Game system type for parameterizing the scanner
 */
export type GameSystem = 'pf1e' | 'pf2e';

/**
 * Efficiently scans a large body of text for natural language skill checks.
 *
 * @param input The text to scan for natural language checks
 * @param system The game system to use ('pf1e' or 'pf2e')
 * @returns Array of scan results containing parsed checks and their locations
 */
export function scanForNaturalLanguageChecks(input: string, system: GameSystem): CheckScanResult[] {
	const lowerText = input.toLowerCase();

	const results: CheckScanResult[] = [];

	// Get the appropriate parser function
	const p = system === 'pf1e' ? PF1E_NATURAL_LANGUAGE_PARSER : PF2E_NATURAL_LANGUAGE_PARSER;
	const parser = p.and(P_UTILS.position());

	const trie = new Trie<void>();

	if (system === 'pf2e') {
		for (const word of Object.values(Pf2eSkills)) {
			trie.insert(word.toLowerCase(), undefined);
		}
		for (const word of Object.values(Pf2eMiscSkills)) {
			trie.insert(word.toLowerCase(), undefined);
		}
	} else {
		for (const word of Object.values(Pf1eSkills)) {
			trie.insert(word.toLowerCase(), undefined);
		}
		for (const word of Object.values(Pf1eMiscSkills)) {
			trie.insert(word.toLowerCase(), undefined);
		}
	}
	trie.insert('dc', undefined);

	for (let i = 0; i < lowerText.length; i++) {
		const longestPrefix = trie.findLongestPrefix(lowerText, i);

		if (longestPrefix) {
			const subStr = lowerText.slice(i);

			const result = parser.tryParse(subStr);
			if (result.success) {
				const endIndex = i + result.value[1].index;
				const match = input.slice(i, endIndex);

				results.push({
					check: result.value[0],
					text: match,
					startIndex: i,
					endIndex: endIndex,
				});

				i = endIndex - 1; // Move index to end of matched segment
			}
		}
	}

	// Sort results by start index
	return results.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * Scans text for PF1e natural language checks (convenience function)
 *
 * @param input The text to scan
 * @returns Array of scan results for PF1e checks
 */
export function scanForPf1eChecks(input: string): CheckScanResult[] {
	return scanForNaturalLanguageChecks(input, 'pf1e');
}

/**
 * Scans text for PF2e natural language checks (convenience function)
 *
 * @param input The text to scan
 * @returns Array of scan results for PF2e checks
 */
export function scanForPf2eChecks(input: string): CheckScanResult[] {
	return scanForNaturalLanguageChecks(input, 'pf2e');
}

import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import type { InlineCheck } from 'packages/obsidian/src/rolls/InlineCheck';
import { GameSystem } from 'packages/obsidian/src/rolls/InlineCheck';
import {
	PF1E_NATURAL_LANGUAGE_PARSER,
	PF1E_SKILL_ALTERNATIVES,
	Pf1eMiscSkills,
	Pf1eSkills,
	PF2E_NATURAL_LANGUAGE_PARSER,
	PF2E_SKILL_ALTERNATIVES,
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
	/** The full line of text containing the match */
	line: string;
	/** The starting index of the match within the line */
	lineStartIndex: number;
	/** The ending index of the match within the line (exclusive) */
	lineEndIndex: number;
}

/**
 * Efficiently scans a large body of text for natural language skill checks.
 *
 * @param input The text to scan for natural language checks
 * @param system The game system to use ('pf1e' or 'pf2e')
 * @returns Array of scan results containing parsed checks and their locations
 */
export function scanForNaturalLanguageChecks(input: string, system: GameSystem): CheckScanResult[] {
	const results: CheckScanResult[] = [];

	// Get the appropriate parser function
	const p = system === GameSystem.PF1E ? PF1E_NATURAL_LANGUAGE_PARSER : PF2E_NATURAL_LANGUAGE_PARSER;
	const parser = p.and(P_UTILS.position());

	const trie = new Trie<string>();

	if (system === GameSystem.PF1E) {
		for (const word of Object.values(Pf1eSkills)) {
			trie.insert(word.toLowerCase(), word);
		}
		for (const word of Object.values(Pf1eMiscSkills)) {
			trie.insert(word.toLowerCase(), word);
		}
		for (const word of Object.keys(PF1E_SKILL_ALTERNATIVES)) {
			trie.insert(word.toLowerCase(), PF1E_SKILL_ALTERNATIVES[word]);
		}
	} else {
		for (const word of Object.values(Pf2eSkills)) {
			trie.insert(word.toLowerCase(), word);
		}
		for (const word of Object.values(Pf2eMiscSkills)) {
			trie.insert(word.toLowerCase(), word);
		}
		for (const word of Object.keys(PF2E_SKILL_ALTERNATIVES)) {
			trie.insert(word.toLowerCase(), PF2E_SKILL_ALTERNATIVES[word]);
		}
	}
	trie.insert('dc', 'DC');

	const lines = input.split('\n');
	let index = 0;
	for (const line of lines) {
		const lowerLine = line.toLowerCase();

		for (let i = 0; i < lowerLine.length; i++) {
			const longestPrefix = trie.findLongestPrefix(lowerLine, i);

			if (longestPrefix) {
				const subStr = lowerLine.slice(i);

				const result = parser.tryParse(subStr);
				if (result.success) {
					const endIndex = i + result.value[1].index;
					const match = line.slice(i, endIndex);

					results.push({
						check: result.value[0],
						text: match,
						startIndex: index + i,
						endIndex: index + endIndex,
						line: line,
						lineStartIndex: i,
						lineEndIndex: endIndex,
					});

					i = endIndex - 1; // Move index to end of matched segment
				}
			}
		}

		index += line.length + 1; // +1 for the newline character
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
	return scanForNaturalLanguageChecks(input, GameSystem.PF1E);
}

/**
 * Scans text for PF2e natural language checks (convenience function)
 *
 * @param input The text to scan
 * @returns Array of scan results for PF2e checks
 */
export function scanForPf2eChecks(input: string): CheckScanResult[] {
	return scanForNaturalLanguageChecks(input, GameSystem.PF2E);
}

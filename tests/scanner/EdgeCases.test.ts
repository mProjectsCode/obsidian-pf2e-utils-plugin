import { describe, test, expect } from 'bun:test';
import { scanForNaturalLanguageChecks, scanForPf1eChecks, scanForPf2eChecks } from '../../packages/obsidian/src/rolls/NaturalLanguageCheckScanner';
import { GameSystem } from 'packages/obsidian/src/rolls/Pf2eCheck';

describe('Scanner - Shared Tests (Both PF1e and PF2e)', () => {
	describe('Edge Cases and Boundary Conditions', () => {
		test('should handle empty and whitespace-only input', () => {
			const emptyInputs = ['', '   ', '\n\t\n', '   \n\t   '];

			emptyInputs.forEach(input => {
				expect(scanForPf1eChecks(input)).toHaveLength(0);
				expect(scanForPf2eChecks(input)).toHaveLength(0);
				expect(scanForNaturalLanguageChecks(input, GameSystem.PF1E)).toHaveLength(0);
				expect(scanForNaturalLanguageChecks(input, GameSystem.PF2E)).toHaveLength(0);
			});
		});

		test('should handle very long input strings', () => {
			const longText = 'Lorem ipsum '.repeat(1000) + 'DC 15 Diplomacy check' + ' dolor sit amet'.repeat(1000);

			const pf1eResults = scanForPf1eChecks(longText);
			const pf2eResults = scanForPf2eChecks(longText);

			expect(pf1eResults).toHaveLength(1);
			expect(pf2eResults).toHaveLength(1);

			// Verify positions are correct in long text
			expect(pf1eResults[0].text).toBe('DC 15 Diplomacy');
			expect(pf2eResults[0].text).toBe('DC 15 Diplomacy');
		});

		test('should handle text with only DC but no skill', () => {
			const invalidInputs = ['Make a DC 15 check.', 'The DC 20 is difficult.', 'DC 25 without any skill name.', 'Try a DC check.', 'Just DC text here.'];

			invalidInputs.forEach(input => {
				expect(scanForPf1eChecks(input)).toHaveLength(0);
				expect(scanForPf2eChecks(input)).toHaveLength(0);
			});
		});

		test('should handle text with skill name but no DC', () => {
			const invalidInputs = [
				'Make a Diplomacy check.',
				'Try some Athletics.',
				'Use your Stealth skill.',
				'Roll for Perception.',
				'Athletics is useful here.',
			];

			invalidInputs.forEach(input => {
				expect(scanForPf1eChecks(input)).toHaveLength(0);
				expect(scanForPf2eChecks(input)).toHaveLength(0);
			});
		});

		test('should handle invalid DC values', () => {
			const invalidDCs = ['DC abc Diplomacy', 'DC -5 Athletics', 'DC 15.5 Perception', 'DC infinity Acrobatics'];

			invalidDCs.forEach(input => {
				expect(scanForPf1eChecks(input)).toHaveLength(0);
				expect(scanForPf2eChecks(input)).toHaveLength(0);
			});
		});
	});

	describe('Performance and Efficiency', () => {
		test('should complete quickly on moderately large text', () => {
			const mediumText = `
                ${'A typical adventure scenario with various skill checks scattered throughout. '.repeat(50)}
                Make a DC 15 Diplomacy check to convince the guard. 
                ${'More adventure text here with descriptions and narrative. '.repeat(30)}
                Try an Athletics DC 20 check to climb the wall.
                ${'Additional story content and world-building details continue. '.repeat(40)}
                The ancient runes require a DC 25 Arcana check to decipher.
                ${'Even more text to make this realistically sized for adventure modules. '.repeat(35)}
            `;

			const startTime = Date.now();
			const pf1eResults = scanForPf1eChecks(mediumText);
			const pf2eResults = scanForPf2eChecks(mediumText);
			const endTime = Date.now();

			// Should complete quickly (under 50ms for medium text)
			expect(endTime - startTime).toBeLessThan(50);

			// Should find the expected checks
			expect(pf1eResults.length).toEqual(1); // Diplomacy only
			expect(pf2eResults.length).toEqual(3); // All three checks
		});

		test('should not create overlapping matches', () => {
			const complexText = `
                First DC 15 Diplomacy or Intimidate check, then try Athletics DC 20,
                followed by a Knowledge (arcana) DC 18 or Spellcraft DC 22 check.
                Finally, attempt Stealth DC 16 or Acrobatics DC 19.
            `;

			[scanForPf1eChecks(complexText), scanForPf2eChecks(complexText)].forEach(results => {
				// Verify no overlapping ranges
				for (let i = 0; i < results.length - 1; i++) {
					for (let j = i + 1; j < results.length; j++) {
						const result1 = results[i];
						const result2 = results[j];

						const noOverlap = result1.endIndex <= result2.startIndex || result2.endIndex <= result1.startIndex;
						expect(noOverlap).toBe(true);
					}
				}
			});
		});

		test('should handle repeated skill names without false matches', () => {
			const repeatedText = `
                Diplomacy is important. A character with high Diplomacy can attempt
                a DC 15 Diplomacy check. However, if Diplomacy fails, try Diplomacy
                again with a +2 bonus. Diplomacy checks are common in social encounters.
            `;

			const pf1eResults = scanForPf1eChecks(repeatedText);
			const pf2eResults = scanForPf2eChecks(repeatedText);

			// Should only find the actual DC check, not every mention of "Diplomacy"
			expect(pf1eResults).toHaveLength(1);
			expect(pf2eResults).toHaveLength(1);
			expect(pf1eResults[0].text).toBe('DC 15 Diplomacy');
			expect(pf2eResults[0].text).toBe('DC 15 Diplomacy');
		});
	});

	describe('Text Boundary and Position Accuracy', () => {
		test('should accurately report start and end positions', () => {
			const testText = 'Start of text. Make a DC 18 Perception check. End of text.';

			[scanForPf1eChecks(testText), scanForPf2eChecks(testText)].forEach(results => {
				expect(results).toHaveLength(1);

				const result = results[0];
				expect(result.startIndex).toBe(22); // Position of "DC"
				expect(result.endIndex).toBe(38); // End of "Perception"
				expect(result.text).toBe('DC 18 Perception');
				expect(testText.slice(result.startIndex, result.endIndex)).toBe(result.text);
			});
		});

		test('should handle checks at exact text boundaries', () => {
			const startText = 'DC 15 Diplomacy check starts the text.';
			const endText = 'Text ends with Stealth DC 20';

			[
				{ text: startText, expectedStart: 0 },
				{ text: endText, expectedEnd: endText.length },
			].forEach(({ text, expectedStart, expectedEnd }) => {
				[scanForPf1eChecks(text), scanForPf2eChecks(text)].forEach(results => {
					expect(results).toHaveLength(1);

					if (expectedStart !== undefined) {
						expect(results[0].startIndex).toBe(expectedStart);
					}
					if (expectedEnd !== undefined) {
						expect(results[0].endIndex).toBe(expectedEnd);
					}
				});
			});
		});
	});

	describe('System Parameterization', () => {
		test('should respect system parameter in main function', () => {
			const pf1eSpecificText = 'Make a DC 15 Bluff check.'; // PF1e skill
			const pf2eSpecificText = 'Make a DC 15 Deception check.'; // PF2e skill

			// PF1e system should find Bluff but not Deception
			expect(scanForNaturalLanguageChecks(pf1eSpecificText, GameSystem.PF1E)).toHaveLength(1);
			expect(scanForNaturalLanguageChecks(pf2eSpecificText, GameSystem.PF1E)).toHaveLength(0);

			// PF2e system should find Deception but not Bluff
			expect(scanForNaturalLanguageChecks(pf1eSpecificText, GameSystem.PF2E)).toHaveLength(0);
			expect(scanForNaturalLanguageChecks(pf2eSpecificText, GameSystem.PF2E)).toHaveLength(1);
		});
	});

	describe('Real-world Text Robustness', () => {
		test('should handle text with numbers and punctuation around checks', () => {
			const complexText = `
                Room #3: The ancient chamber (circa 1,247 years old) contains several challenges.
                1. First, make a DC 15 Perception check.
                2. Then attempt to talk to the talking door (Diplomacy DC 20).
                3. Finally, try DC 18 Thievery (if you have tools).
                
                Note: All DCs assume level 3 characters.
            `;

			[scanForPf1eChecks(complexText), scanForPf2eChecks(complexText)].forEach(results => {
				expect(results.length).toBeGreaterThanOrEqual(2);

				// Verify it doesn't match false positives like "1,247" or "level 3"
				results.forEach(result => {
					expect(result.check.dc).toBeGreaterThan(10);
					expect(result.check.dc).toBeLessThan(30);
				});
			});
		});

		test('should handle mixed formatting and inconsistent capitalization', () => {
			const inconsistentText = `
                make a dc 15 DIPLOMACY check, then try Athletics DC 20,
                followed by a Dc 18 stealth Check, and finally DC 25 thievery.
            `;

			[scanForPf1eChecks(inconsistentText), scanForPf2eChecks(inconsistentText)].forEach(results => {
				expect(results.length).toBeGreaterThanOrEqual(2);

				expect(results.map(r => r.text).some(text => text.includes('DIPLOMACY'))).toBe(true);
			});
		});

		test('should handle checks embedded in complex sentences', () => {
			const embeddedText = `
                Characters who succeed on a DC 22 Perception check while actively searching
                the chamber (which takes 10 minutes) will notice that one of the stone blocks
                in the eastern wall protrudes slightly. This discovery allows them to attempt
                a DC 18 Athletics/DC 18 Strength check to push the block inward, revealing a secret passage.
                However, if they fail the Athletics check by 5 or more, the block becomes
                stuck and requires a DC 25 Athletics/DC 25 Strength check to move.
            `;

			[scanForPf1eChecks(embeddedText), scanForPf2eChecks(embeddedText)].forEach(results => {
				expect(results.length).toBeGreaterThanOrEqual(2);

				// Verify we found different DCs
				const dcs = results.map(r => r.check.dc).filter(dc => dc !== undefined);
				const uniqueDCs = new Set(dcs);
				expect(uniqueDCs.size).toBeGreaterThanOrEqual(2);
			});
		});
	});

	test('should handle unicode and special characters', () => {
		const unicodeText = `
			The ancient tome contains eldritch symbols. Make a DC 20 Knowledge (arcana) check
			to decipher the text: "Ἀρχή ἐστι τὸ ἥμισυ παντός" and "魔法の力".
			If successful, attempt Religion DC 18 to understand the ritual's purpose.
		`;

		[scanForPf1eChecks(unicodeText), scanForPf2eChecks(unicodeText)].forEach(results => {
			expect(results.length).toBeGreaterThanOrEqual(1);

			// Should still find the checks despite unicode content
			results.forEach(result => {
				expect(result.text).toMatch(/DC \d+/);
			});
		});
	});
});

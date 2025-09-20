import { describe, test, expect } from 'bun:test';
import { scanForNaturalLanguageChecks, scanForPf1eChecks, scanForPf2eChecks } from '../../packages/obsidian/src/rolls/NaturalLanguageCheckScanner';

describe('Scanner - Performance and Stress Tests', () => {
	describe('Large Text Performance', () => {
		test('should handle very large documents efficiently', () => {
			// Create a large document similar to a full adventure module
			const largeDocument = [
				'Adventure Module: The Siege of Thornfield Keep',
				'Table of Contents...',
				'',
				'Chapter 1: Introduction',
				'The ancient fortress of Thornfield Keep...',
				'',
				// Add many paragraphs with various skill checks
				...Array.from(
					{ length: 50 },
					(_, i) => `
                    Encounter ${i + 1}: 
                    The party encounters various challenges here. Make a DC ${15 + (i % 10)} Perception 
                    check to notice important details. Characters can attempt a DC ${18 + (i % 8)} 
                    Athletics check to overcome physical obstacles. Social interactions require 
                    Diplomacy DC ${12 + (i % 15)} or Intimidation DC ${20 + (i % 12)}.
                    
                    Additional flavor text continues here with more details about the encounter,
                    the environment, potential tactics, and story implications. This represents
                    the typical verbose style of published adventure modules.
                `,
				),
				'',
				'Chapter 2: The Keep Proper',
				'Detailed room descriptions follow...',
				...Array.from(
					{ length: 30 },
					(_, i) => `
                    Room ${i + 1}: 
                    This chamber contains ancient artifacts. Knowledge checks (DC ${16 + (i % 9)}) 
                    reveal historical significance. Searching thoroughly requires Perception DC ${14 + (i % 6)}.
                    Hidden secrets can be found with Investigation DC ${19 + (i % 11)} (PF2e) or 
                    Search DC ${17 + (i % 8)} (PF1e).
                `,
				),
				'',
				'Appendix A: NPCs and Statistics',
				'Appendix B: Treasure and Rewards',
				'Appendix C: Handouts and Maps',
			].join('\n');

			const startTime = Date.now();

			const pf1eResults = scanForPf1eChecks(largeDocument);
			const pf2eResults = scanForPf2eChecks(largeDocument);

			const endTime = Date.now();
			const totalTime = endTime - startTime;

			// Should find many checks
			expect(pf1eResults.length).toBeGreaterThan(100);
			expect(pf2eResults.length).toBeGreaterThan(100);

			// All results should be valid
			[pf1eResults, pf2eResults].forEach(results => {
				results.forEach(result => {
					expect(result.check.dc).toBeGreaterThan(0);
					expect(result.check.type.length).toBeGreaterThan(0);
					expect(result.startIndex).toBeGreaterThanOrEqual(0);
					expect(result.endIndex).toBeLessThanOrEqual(largeDocument.length);
					expect(result.text).toBe(largeDocument.slice(result.startIndex, result.endIndex));
				});
			});

			console.log(`Performance test: ${totalTime}ms for ${largeDocument.length} characters`);
			console.log(`Found ${pf1eResults.length} PF1e checks, ${pf2eResults.length} PF2e checks`);
		});

		test('should handle documents with many consecutive checks', () => {
			// Create text with many checks close together
			const denseCheckText =
				Array.from({ length: 100 }, (_, i) => `DC ${10 + (i % 20)} Skill${i % 10} check. `).join('') +
				Array.from({ length: 50 }, (_, i) => `Make Athletics DC ${15 + (i % 15)} then Stealth DC ${12 + (i % 18)}. `).join('');

			const startTime = Date.now();
			const results = scanForPf2eChecks(denseCheckText);
			const endTime = Date.now();

			// Should still complete quickly even with dense check patterns
			expect(endTime - startTime).toBeLessThan(100);

			// Should handle overlapping patterns correctly
			results.forEach((result, index) => {
				expect(result.check.dc).toBeGreaterThan(0);

				// Verify no overlaps with subsequent results
				for (let j = index + 1; j < results.length; j++) {
					const other = results[j];
					const noOverlap = result.endIndex <= other.startIndex || other.endIndex <= result.startIndex;
					expect(noOverlap).toBe(true);
				}
			});
		});

		test('should handle worst-case regex backtracking scenarios', () => {
			// Create patterns that could cause regex backtracking issues
			const backtrackingText = [
				'DC DC DC DC DC DC DC DC DC DC 15 Perception check',
				'Make Make Make Make a a a a DC DC DC 20 Athletics Athletics Athletics',
				'The The The DC DC DC 18 18 18 Stealth Stealth check check check',
				'Very very very long long long sentence sentence with with DC DC 25 25 skill skill name name repeated repeated',
			].join('. ');

			const startTime = Date.now();
			const results = scanForPf1eChecks(backtrackingText);
			const endTime = Date.now();

			// Should complete without hanging (under 50ms)
			expect(endTime - startTime).toBeLessThan(50);

			// Should still find valid checks
			expect(results.length).toBeGreaterThan(0);
			results.forEach(result => {
				expect(result.check.dc).toBeGreaterThan(0);
			});
		});
	});

	describe('Stress Test Edge Cases', () => {
		test('should handle extremely long skill names', () => {
			const longSkillText = `
                Make a DC 15 ${'Extremely'.repeat(50)}LongSkillName check.
                Try DC 20 Knowledge with many parentheses ${'('.repeat(20)}arcana${')'.repeat(20)}.
            `;

			expect(() => {
				const results = scanForPf1eChecks(longSkillText);
				// Should not crash, even if it doesn't find valid matches
				results.forEach(result => {
					expect(result.startIndex).toBeGreaterThanOrEqual(0);
					expect(result.endIndex).toBeGreaterThan(result.startIndex);
				});
			}).not.toThrow();
		});

		test('should handle text with thousands of DC mentions', () => {
			const manyDCsText = Array.from({ length: 1000 }, (_, i) =>
				i % 100 === 0 ? `DC ${15 + (i % 10)} Perception check` : `DC ${i % 50} without skill name`,
			).join(' and then ');

			const startTime = Date.now();
			const results = scanForPf2eChecks(manyDCsText);
			const endTime = Date.now();

			// Should complete in reasonable time
			expect(endTime - startTime).toBeLessThan(100);

			// Should only find the valid checks (about 10 out of 1000)
			expect(results.length).toBeLessThan(20);
			expect(results.length).toBeGreaterThan(5);
		});

		test('should handle text with nested and recursive patterns', () => {
			const recursiveText = `
                Perception check, followed by Athletics DC 20 (or Athletics DC 18 if you have rope)) 
                and finally Diplomacy DC 25 (or Intimidation DC 22).
            `;

			const results = scanForPf2eChecks(recursiveText);

			// Should find multiple valid checks without being confused by nesting
			expect(results.length).toBeGreaterThan(3);

			// Verify all found checks are valid
			results.forEach(result => {
				expect(result.check.dc).toBeGreaterThan(0);
				expect(result.check.type.length).toBeGreaterThan(0);
			});
		});
	});
});

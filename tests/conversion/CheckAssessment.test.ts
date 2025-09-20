import { describe, test, expect } from 'bun:test';
import {
	Pf2eProficiency,
	Pf2eCheckDifficulty,
	pf2eCheckRequiredProficiency,
	pf2eCheckDifficulty,
	pf2eLevelBasedDC,
} from '../../packages/obsidian/src/rolls/InlineCheckConversion';

describe('PF2e Check Assessment', () => {
	describe('Proficiency Requirements Analysis', () => {
		test('should require untrained for low DCs', () => {
			const lowDCs = [5, 8, 10, 12, 14];
			lowDCs.forEach(dc => {
				expect(pf2eCheckRequiredProficiency(dc)).toBe(Pf2eProficiency.UNTRAINED);
			});
		});

		test('should require trained for moderate DCs', () => {
			const moderateDCs = [15, 16, 17, 18, 19];
			moderateDCs.forEach(dc => {
				expect(pf2eCheckRequiredProficiency(dc)).toBe(Pf2eProficiency.TRAINED);
			});
		});

		test('should require expert for challenging DCs', () => {
			const challengingDCs = [20, 22, 25, 27, 29];
			challengingDCs.forEach(dc => {
				expect(pf2eCheckRequiredProficiency(dc)).toBe(Pf2eProficiency.EXPERT);
			});
		});

		test('should require master for difficult DCs', () => {
			const difficultDCs = [30, 32, 35, 37, 39];
			difficultDCs.forEach(dc => {
				expect(pf2eCheckRequiredProficiency(dc)).toBe(Pf2eProficiency.MASTER);
			});
		});

		test('should require legendary for epic DCs', () => {
			const epicDCs = [40, 42, 45, 50, 60];
			epicDCs.forEach(dc => {
				expect(pf2eCheckRequiredProficiency(dc)).toBe(Pf2eProficiency.LEGENDARY);
			});
		});
	});

	describe('Difficulty Assessment Scenarios', () => {
		test.each([3, 10, 18])('should assess scenarios consistently at level %d', level => {
			const levelBasedDC = pf2eLevelBasedDC(level);

			// Test different difficulty scenarios for low level
			expect(pf2eCheckDifficulty(level, levelBasedDC - 10)).toBe(Pf2eCheckDifficulty.INCREDIBLY_EASY);
			expect(pf2eCheckDifficulty(level, levelBasedDC - 5)).toBe(Pf2eCheckDifficulty.VERY_EASY);
			expect(pf2eCheckDifficulty(level, levelBasedDC - 2)).toBe(Pf2eCheckDifficulty.EASY);
			expect(pf2eCheckDifficulty(level, levelBasedDC)).toBe(Pf2eCheckDifficulty.AVERAGE);
			expect(pf2eCheckDifficulty(level, levelBasedDC + 2)).toBe(Pf2eCheckDifficulty.HARD);
			expect(pf2eCheckDifficulty(level, levelBasedDC + 5)).toBe(Pf2eCheckDifficulty.VERY_HARD);
			expect(pf2eCheckDifficulty(level, levelBasedDC + 10)).toBe(Pf2eCheckDifficulty.INCREDIBLY_HARD);
		});
	});

	describe('Should provide accurate proficiency and difficulty assessments across different levels and DCs', () => {
		const scenarios = [
			{ level: 1, dc: 12, expectedDifficulty: Pf2eCheckDifficulty.EASY, expectedProficiency: Pf2eProficiency.UNTRAINED },
			{ level: 1, dc: 16, expectedDifficulty: Pf2eCheckDifficulty.AVERAGE, expectedProficiency: Pf2eProficiency.TRAINED },
			{ level: 5, dc: 20, expectedDifficulty: Pf2eCheckDifficulty.AVERAGE, expectedProficiency: Pf2eProficiency.EXPERT },
			{ level: 10, dc: 30, expectedDifficulty: Pf2eCheckDifficulty.HARD, expectedProficiency: Pf2eProficiency.MASTER },
			{ level: 15, dc: 40, expectedDifficulty: Pf2eCheckDifficulty.VERY_HARD, expectedProficiency: Pf2eProficiency.LEGENDARY },
			{ level: 20, dc: 35, expectedDifficulty: Pf2eCheckDifficulty.VERY_EASY, expectedProficiency: Pf2eProficiency.MASTER },
		];

		test.each(scenarios)('scenario: %o', scenario => {
			const proficiency = pf2eCheckRequiredProficiency(scenario.dc);
			const difficulty = pf2eCheckDifficulty(scenario.level, scenario.dc);

			expect(proficiency).toBe(scenario.expectedProficiency);
			expect(difficulty).toBe(scenario.expectedDifficulty);

			// Log for manual verification if needed
			// console.log(`Level ${scenario.level}, DC ${scenario.dc}: ${difficulty} (${proficiency})`);
		});
	});

	describe('Edge Cases and Robustness', () => {
		test('should handle extreme DC values gracefully', () => {
			// Test very low DCs
			expect(pf2eCheckRequiredProficiency(1)).toBe(Pf2eProficiency.UNTRAINED);
			expect(pf2eCheckDifficulty(10, 1)).toBeDefined();

			// Test very high DCs
			expect(pf2eCheckRequiredProficiency(100)).toBe(Pf2eProficiency.LEGENDARY);
			expect(pf2eCheckDifficulty(10, 100)).toBeDefined();
		});

		test('should handle boundary values precisely', () => {
			// Test exact boundary values for proficiency
			expect(pf2eCheckRequiredProficiency(14)).toBe(Pf2eProficiency.UNTRAINED);
			expect(pf2eCheckRequiredProficiency(15)).toBe(Pf2eProficiency.TRAINED);
			expect(pf2eCheckRequiredProficiency(19)).toBe(Pf2eProficiency.TRAINED);
			expect(pf2eCheckRequiredProficiency(20)).toBe(Pf2eProficiency.EXPERT);
			expect(pf2eCheckRequiredProficiency(29)).toBe(Pf2eProficiency.EXPERT);
			expect(pf2eCheckRequiredProficiency(30)).toBe(Pf2eProficiency.MASTER);
			expect(pf2eCheckRequiredProficiency(39)).toBe(Pf2eProficiency.MASTER);
			expect(pf2eCheckRequiredProficiency(40)).toBe(Pf2eProficiency.LEGENDARY);
		});
	});
});

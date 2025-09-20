import { describe, test, expect } from 'bun:test';
import { convertPf1eToPf2eDC, pf2eLevelBasedDC } from '../../packages/obsidian/src/rolls/InlineCheckConversion';

describe('PF1e to PF2e Conversion Table Validation', () => {
	describe('Table Data Integrity', () => {
		test('should have data for all expected levels', () => {
			// Test that all levels 1-20 have conversion data
			for (let level = 1; level <= 20; level++) {
				expect(() => pf2eLevelBasedDC(level)).not.toThrow();

				// Test a mid-range DC for each level that should work
				const result = convertPf1eToPf2eDC(level, 20);
				expect(result).toBeDefined();
			}
		});

		test.each([
			{ level: 1, pf1eDC: -2, expectedPf2eDC: 5 },
			{ level: 1, pf1eDC: 10, expectedPf2eDC: 14 },
			{ level: 1, pf1eDC: 20, expectedPf2eDC: 18 },
			{ level: 5, pf1eDC: 5, expectedPf2eDC: 13 },
			{ level: 5, pf1eDC: 15, expectedPf2eDC: 19 },
			{ level: 5, pf1eDC: 25, expectedPf2eDC: 24 },
			{ level: 20, pf1eDC: 17, expectedPf2eDC: 30 },
			{ level: 20, pf1eDC: 25, expectedPf2eDC: 37 },
			{ level: 20, pf1eDC: 28, expectedPf2eDC: 38 },
		])('should validate conversion: %o', ({ level, pf1eDC, expectedPf2eDC }) => {
			expect(convertPf1eToPf2eDC(level, pf1eDC)).toBe(expectedPf2eDC);
		});
	});

	describe('Boundary Testing', () => {
		describe('should handle all valid PF1e DC ranges for each level', () => {
			// Test the full range of valid PF1e DCs for different levels
			const testCases = [
				{ level: 1, minDC: -2, maxDC: 28 },
				{ level: 5, minDC: 2, maxDC: 32 },
				{ level: 10, minDC: 7, maxDC: 37 },
				{ level: 15, minDC: 12, maxDC: 42 },
				{ level: 20, minDC: 17, maxDC: 47 },
			];

			test.each(testCases)('%o', testCase => {
				// Test minimum valid DC
				const minResult = convertPf1eToPf2eDC(testCase.level, testCase.minDC);
				expect(minResult).toBeDefined();

				// Test maximum valid DC
				const maxResult = convertPf1eToPf2eDC(testCase.level, testCase.maxDC);
				expect(maxResult).toBeDefined();

				// Test one below minimum (should be undefined)
				const belowMin = convertPf1eToPf2eDC(testCase.level, testCase.minDC - 1);
				expect(belowMin).toBeUndefined();

				// Test one above maximum (should be undefined)
				const aboveMax = convertPf1eToPf2eDC(testCase.level, testCase.maxDC + 1);
				expect(aboveMax).toBeUndefined();
			});
		});

		test('should handle floating point inputs gracefully', () => {
			// Test that the function handles non-integer inputs reasonably
			expect(convertPf1eToPf2eDC(5.7, 15)).toBeUndefined(); // Non-integer level
			const floatDCResult = convertPf1eToPf2eDC(5, 15.3); // Non-integer DC
			expect(floatDCResult === undefined || isNaN(floatDCResult)).toBe(true);
		});
	});
});

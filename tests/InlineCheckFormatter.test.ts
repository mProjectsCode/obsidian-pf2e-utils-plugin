import { describe, test, expect } from 'bun:test';
import { INLINE_CHECK_PARSER, formatInlineCheck, type InlineCheck, GameSystem } from '../packages/obsidian/src/rolls/InlineCheck';

describe('InlineCheck Formatter', () => {
	describe('Basic Examples', () => {
		test('should format basic fortitude check', () => {
			const check: InlineCheck = { type: ['fortitude'], system: GameSystem.PF2E, other: [], dc: 20, basic: true };
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 20 Basic Fortitude');
		});

		test('should format athletics check with traits', () => {
			const check: InlineCheck = {
				type: ['athletics'],
				system: GameSystem.PF2E,
				other: ['traits:action:long-jump'],
				dc: 20,
			};
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 20 Athletics');
		});

		test('should format flat check', () => {
			const check: InlineCheck = { type: ['flat'], system: GameSystem.PF2E, other: [], dc: 4 };
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 4 Flat');
		});

		test('should format multiple skill types', () => {
			const check: InlineCheck = { type: ['arcane', 'occultism'], system: GameSystem.PF2E, other: [], dc: 20 };
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 20 Arcane or Occultism');
		});

		test('should format check single adjustment', () => {
			const check: InlineCheck = {
				type: ['thievery'],
				system: GameSystem.PF2E,
				other: [],
				dc: 20,
				adjustment: [-2],
			};
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 20 Thievery (-2)');
		});

		test('should format check with adjustments', () => {
			const check: InlineCheck = {
				type: ['crafting', 'thievery'],
				system: GameSystem.PF2E,
				other: [],
				dc: 20,
				adjustment: [0, -2],
			};
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 20 Crafting or Thievery (-2)');
		});

		test('should format defense check', () => {
			const check: InlineCheck = { type: ['deception'], system: GameSystem.PF2E, other: [], defense: 'perception' };
			const result = formatInlineCheck(check);
			expect(result).toBe('Deception vs Perception');
		});

		test('should format against check with basic', () => {
			const check: InlineCheck = {
				type: ['reflex'],
				system: GameSystem.PF2E,
				other: ['against:class-spell'],
				basic: true,
			};
			const result = formatInlineCheck(check);
			expect(result).toBe('Basic Reflex');
		});
	});

	describe('Complex Combinations', () => {
		test('should format check with all parameters', () => {
			const check: InlineCheck = {
				type: ['athletics', 'acrobatics'],
				system: GameSystem.PF2E,
				other: ['traits:action:climb', 'against:spell'],
				dc: 15,
				defense: 'AC',
				adjustment: [2, -1],
				basic: true,
			};
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 15 Basic Athletics (+2) or Acrobatics (-1) vs AC');
		});

		test('should format check with positive and negative adjustments', () => {
			const check: InlineCheck = {
				type: ['stealth', 'survival', 'perception', 'intimidation'],
				system: GameSystem.PF2E,
				other: [],
				dc: 18,
				adjustment: [5, -3, 0, 2],
			};
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 18 Stealth (+5) or Survival (-3) or Perception or Intimidation (+2)');
		});

		test('should format check with complex traits', () => {
			const check: InlineCheck = {
				type: ['medicine'],
				system: GameSystem.PF2E,
				other: ['traits:action:treat-wounds:expert'],
				dc: 25,
			};
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 25 Medicine');
		});

		test('should format check with multiple traits', () => {
			const check: InlineCheck = {
				type: ['survival'],
				system: GameSystem.PF2E,
				other: ['traits:exploration,downtime,concentrate'],
				dc: 15,
			};
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 15 Survival');
		});
	});

	describe('Edge Cases', () => {
		test('should handle single character skill names', () => {
			const check: InlineCheck = { type: ['a'], system: GameSystem.PF2E, other: [], dc: 5 };
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 5 A');
		});

		test('should handle high DC values', () => {
			const check: InlineCheck = { type: ['perception'], system: GameSystem.PF2E, other: [], dc: 999 };
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 999 Perception');
		});

		test('should handle check with only type (no DC)', () => {
			const check: InlineCheck = { type: ['athletics'], system: GameSystem.PF2E, other: [] };
			const result = formatInlineCheck(check);
			expect(result).toBe('Athletics');
		});

		test('should handle zero adjustments', () => {
			const check: InlineCheck = {
				type: ['intimidation'],
				system: GameSystem.PF2E,
				other: [],
				dc: 12,
				adjustment: [0],
			};
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 12 Intimidation');
		});

		test('should handle negative DC (edge case)', () => {
			const check: InlineCheck = { type: ['test'], system: GameSystem.PF2E, other: [], dc: -5 };
			const result = formatInlineCheck(check);
			expect(result).toBe('DC -5 Test');
		});

		test('should handle three skill types', () => {
			const check: InlineCheck = {
				type: ['arcane', 'occultism', 'religion'],
				system: GameSystem.PF2E,
				other: [],

				dc: 15,
			};
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 15 Arcane or Occultism or Religion');
		});

		test('should handle defense with multiple skills', () => {
			const check: InlineCheck = {
				type: ['intimidation', 'diplomacy'],
				system: GameSystem.PF2E,
				other: [],
				defense: 'will',
			};
			const result = formatInlineCheck(check);
			expect(result).toBe('Intimidation or Diplomacy vs Will');
		});

		test('should handle mixed adjustments with some zeros', () => {
			const check: InlineCheck = {
				type: ['athletics', 'acrobatics', 'survival'],
				system: GameSystem.PF2E,
				other: [],
				dc: 15,
				adjustment: [3, 0, -1],
			};
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 15 Athletics (+3) or Acrobatics or Survival (-1)');
		});
	});

	describe('Error Handling', () => {
		test('should throw error when adjustment array length mismatches type array length', () => {
			const check: InlineCheck = {
				type: ['athletics', 'acrobatics'],
				system: GameSystem.PF2E,
				other: [],
				dc: 15,
				adjustment: [2, -1, 3], // 3 adjustments for 2 skills
			};

			expect(() => formatInlineCheck(check)).toThrow('Adjustment array length (3) must match type array length (2)');
		});

		test('should throw error when adjustment array is shorter than type array', () => {
			const check: InlineCheck = {
				type: ['athletics', 'acrobatics', 'survival'],
				system: GameSystem.PF2E,
				other: [],
				dc: 15,
				adjustment: [2], // 1 adjustment for 3 skills
			};

			expect(() => formatInlineCheck(check)).toThrow('Adjustment array length (1) must match type array length (3)');
		});
	});

	describe('Capitalization', () => {
		test('should properly capitalize skill names', () => {
			const check: InlineCheck = { type: ['FORTITUDE', 'athletics', 'lOrE'], system: GameSystem.PF2E, other: [], dc: 15 };
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 15 Fortitude or Athletics or Lore');
		});

		test('should properly capitalize defense names', () => {
			const check: InlineCheck = {
				type: ['deception'],
				system: GameSystem.PF2E,
				other: [],
				defense: 'PERCEPTION',
			};
			const result = formatInlineCheck(check);
			expect(result).toBe('Deception vs Perception');
		});
	});

	describe('Integration with Parser', () => {
		test('should format parsed basic check correctly', () => {
			const input = '@Check[fortitude|dc:20|basic]';
			const parseResult = INLINE_CHECK_PARSER.tryParse(input);

			expect(parseResult.success).toBe(true);
			if (parseResult.success) {
				const formatted = formatInlineCheck(parseResult.value);
				expect(formatted).toBe('DC 20 Basic Fortitude');
			}
		});

		test('should format parsed complex check correctly', () => {
			const input = '@Check[athletics,acrobatics|dc:15|traits:action:climb|basic]';
			const parseResult = INLINE_CHECK_PARSER.tryParse(input);

			expect(parseResult.success).toBe(true);
			if (parseResult.success) {
				const formatted = formatInlineCheck(parseResult.value);
				expect(formatted).toBe('DC 15 Basic Athletics or Acrobatics');
			}
		});

		test('should format parsed defense check correctly', () => {
			const input = '@Check[deception|defense:perception]';
			const parseResult = INLINE_CHECK_PARSER.tryParse(input);

			expect(parseResult.success).toBe(true);
			if (parseResult.success) {
				const formatted = formatInlineCheck(parseResult.value);
				expect(formatted).toBe('Deception vs Perception');
			}
		});

		test('should format parsed adjustment check correctly', () => {
			const input = '@Check[crafting,thievery|dc:20|adjustment:0,-2]';
			const parseResult = INLINE_CHECK_PARSER.tryParse(input);

			expect(parseResult.success).toBe(true);
			if (parseResult.success) {
				const formatted = formatInlineCheck(parseResult.value);
				expect(formatted).toBe('DC 20 Crafting or Thievery (-2)');
			}
		});
	});

	describe('Round-trip Compatibility', () => {
		test.each([
			{
				input: '@Check[fortitude|dc:20|basic]',
				expected: 'DC 20 Basic Fortitude',
			},
			{
				input: '@Check[athletics|dc:20|traits:action:long-jump]',
				expected: 'DC 20 Athletics',
			},
			{
				input: '@Check[flat|dc:4]',
				expected: 'DC 4 Flat',
			},
			{
				input: '@Check[arcane,occultism|dc:20]',
				expected: 'DC 20 Arcane or Occultism',
			},
			{
				input: '@Check[crafting,thievery|dc:20|adjustment:0,-2]',
				expected: 'DC 20 Crafting or Thievery (-2)',
			},
			{
				input: '@Check[deception|defense:perception]',
				expected: 'Deception vs Perception',
			},
			{
				input: '@Check[reflex|against:class-spell|basic]',
				expected: 'Basic Reflex',
			},
		])('should format $input as $expected', ({ input, expected }) => {
			const parseResult = INLINE_CHECK_PARSER.tryParse(input);
			expect(parseResult.success).toBe(true);

			if (parseResult.success) {
				const formatted = formatInlineCheck(parseResult.value);
				expect(formatted).toBe(expected);
			}
		});
	});
});

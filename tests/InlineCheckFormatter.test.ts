import { describe, test, expect } from 'bun:test';
import { INLINE_CHECK_PARSER, formatInlineCheck, type InlineCheck, GameSystem } from '../packages/obsidian/src/rolls/InlineCheck';

describe('InlineCheck Formatter', () => {
	describe('Basic Examples', () => {
		test('should format basic fortitude check', () => {
			const check: InlineCheck = { type: ['fortitude'], dc: 20, basic: true, system: GameSystem.PF2E };
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 20 Basic Fortitude');
		});

		test('should format athletics check with traits', () => {
			const check: InlineCheck = {
				type: ['athletics'],
				dc: 20,
				traits: ['action:long-jump'],
				system: GameSystem.PF2E,
			};
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 20 Athletics [action:long-jump]');
		});

		test('should format flat check', () => {
			const check: InlineCheck = { type: ['flat'], dc: 4, system: GameSystem.PF2E };
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 4 Flat');
		});

		test('should format multiple skill types', () => {
			const check: InlineCheck = { type: ['arcane', 'occultism'], dc: 20, system: GameSystem.PF2E };
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 20 Arcane or Occultism');
		});

		test('should format check with adjustments', () => {
			const check: InlineCheck = {
				type: ['crafting', 'thievery'],
				dc: 20,
				adjustment: [0, -2],
				system: GameSystem.PF2E,
			};
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 20 Crafting or Thievery (-2)');
		});

		test('should format defense check', () => {
			const check: InlineCheck = { type: ['deception'], defense: 'perception', system: GameSystem.PF2E };
			const result = formatInlineCheck(check);
			expect(result).toBe('Deception vs Perception');
		});

		test('should format against check with basic', () => {
			const check: InlineCheck = {
				type: ['reflex'],
				against: 'class-spell',
				basic: true,
				system: GameSystem.PF2E,
			};
			const result = formatInlineCheck(check);
			expect(result).toBe('Basic Reflex against class-spell');
		});
	});

	describe('Complex Combinations', () => {
		test('should format check with all parameters', () => {
			const check: InlineCheck = {
				type: ['athletics', 'acrobatics'],
				dc: 15,
				traits: ['action:climb'],
				defense: 'ac',
				against: 'spell',
				adjustment: [2, -1],
				basic: true,
				system: GameSystem.PF2E,
			};
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 15 Basic Athletics (+2) or Acrobatics (-1) vs Ac against spell [action:climb]');
		});

		test('should format check with positive and negative adjustments', () => {
			const check: InlineCheck = {
				type: ['stealth', 'survival', 'perception', 'intimidation'],
				dc: 18,
				adjustment: [5, -3, 0, 2],
				system: GameSystem.PF2E,
			};
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 18 Stealth (+5) or Survival (-3) or Perception or Intimidation (+2)');
		});

		test('should format check with complex traits', () => {
			const check: InlineCheck = {
				type: ['medicine'],
				dc: 25,
				traits: ['action:treat-wounds:expert'],
				system: GameSystem.PF2E,
			};
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 25 Medicine [action:treat-wounds:expert]');
		});

		test('should format check with multiple traits', () => {
			const check: InlineCheck = {
				type: ['survival'],
				dc: 15,
				traits: ['exploration', 'downtime', 'concentrate'],
				system: GameSystem.PF2E,
			};
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 15 Survival [exploration, downtime, concentrate]');
		});
	});

	describe('Edge Cases', () => {
		test('should handle single character skill names', () => {
			const check: InlineCheck = { type: ['a'], dc: 5, system: GameSystem.PF2E };
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 5 A');
		});

		test('should handle high DC values', () => {
			const check: InlineCheck = { type: ['perception'], dc: 999, system: GameSystem.PF2E };
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 999 Perception');
		});

		test('should handle check with only type (no DC)', () => {
			const check: InlineCheck = { type: ['athletics'], system: GameSystem.PF2E };
			const result = formatInlineCheck(check);
			expect(result).toBe('Athletics');
		});

		test('should handle zero adjustments', () => {
			const check: InlineCheck = {
				type: ['intimidation'],
				dc: 12,
				adjustment: [0],
				system: GameSystem.PF2E,
			};
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 12 Intimidation');
		});

		test('should handle negative DC (edge case)', () => {
			const check: InlineCheck = { type: ['test'], dc: -5, system: GameSystem.PF2E };
			const result = formatInlineCheck(check);
			expect(result).toBe('DC -5 Test');
		});

		test('should handle three skill types', () => {
			const check: InlineCheck = {
				type: ['arcane', 'occultism', 'religion'],
				dc: 15,
				system: GameSystem.PF2E,
			};
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 15 Arcane or Occultism or Religion');
		});

		test('should handle defense with multiple skills', () => {
			const check: InlineCheck = {
				type: ['intimidation', 'diplomacy'],
				defense: 'will',
				system: GameSystem.PF2E,
			};
			const result = formatInlineCheck(check);
			expect(result).toBe('Intimidation or Diplomacy vs Will');
		});

		test('should handle mixed adjustments with some zeros', () => {
			const check: InlineCheck = {
				type: ['athletics', 'acrobatics', 'survival'],
				dc: 15,
				adjustment: [3, 0, -1],
				system: GameSystem.PF2E,
			};
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 15 Athletics (+3) or Acrobatics or Survival (-1)');
		});
	});

	describe('Error Handling', () => {
		test('should throw error when adjustment array length mismatches type array length', () => {
			const check: InlineCheck = {
				type: ['athletics', 'acrobatics'],
				dc: 15,
				adjustment: [2, -1, 3], // 3 adjustments for 2 skills
				system: GameSystem.PF2E,
			};

			expect(() => formatInlineCheck(check)).toThrow('Adjustment array length (3) must match type array length (2)');
		});

		test('should throw error when adjustment array is shorter than type array', () => {
			const check: InlineCheck = {
				type: ['athletics', 'acrobatics', 'survival'],
				dc: 15,
				adjustment: [2], // 1 adjustment for 3 skills
				system: GameSystem.PF2E,
			};

			expect(() => formatInlineCheck(check)).toThrow('Adjustment array length (1) must match type array length (3)');
		});
	});

	describe('Capitalization', () => {
		test('should properly capitalize skill names', () => {
			const check: InlineCheck = { type: ['FORTITUDE', 'athletics', 'lOrE'], dc: 15, system: GameSystem.PF2E };
			const result = formatInlineCheck(check);
			expect(result).toBe('DC 15 Fortitude or Athletics or Lore');
		});

		test('should properly capitalize defense names', () => {
			const check: InlineCheck = {
				type: ['deception'],
				defense: 'PERCEPTION',
				system: GameSystem.PF2E,
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
				expect(formatted).toBe('DC 15 Basic Athletics or Acrobatics [action:climb]');
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
				expected: 'DC 20 Athletics [action:long-jump]',
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
				expected: 'Basic Reflex against class-spell',
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

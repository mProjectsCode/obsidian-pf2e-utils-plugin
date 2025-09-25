import { describe, test, expect } from 'bun:test';
import { INLINE_CHECK_PARSER, type Pf2eCheck, stringifyInlineCheck, GameSystem, formatPf2eCheck } from '../packages/obsidian/src/rolls/Pf2eCheck';
import { Pf1eMiscSkills, Pf1eSkills, Pf2eMiscSkills, Pf2eSkills } from 'packages/obsidian/src/rolls/NaturalLanguageCheck';

describe('PF2E Check Parser', () => {
	describe('Example Cases', () => {
		test('should parse basic fortitude check with DC', () => {
			const input = '@Check[fortitude|dc:20|basic]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				const check: Pf2eCheck = result.value;
				expect(check.type).toEqual([Pf2eMiscSkills.Fortitude]);
				expect(check.dc).toBe(20);
				expect(check.basic).toBe(true);
				expect(check.defense).toBeUndefined();
				expect(check.adjustment).toBeUndefined();
				expect(check.other).toEqual([]);
			}
		});

		test('should parse athletics check with DC and traits', () => {
			const input = '@Check[athletics|dc:20|traits:action:long-jump]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				const check: Pf2eCheck = result.value;
				expect(check.type).toEqual([Pf2eSkills.Athletics]);
				expect(check.dc).toBe(20);
				expect(check.basic).toBeUndefined();
				expect(check.defense).toBeUndefined();
				expect(check.adjustment).toBeUndefined();
				expect(check.other).toEqual(['traits:action:long-jump']);
			}
		});

		test('should parse flat check with DC only', () => {
			const input = '@Check[flat|dc:4]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				const check: Pf2eCheck = result.value;
				expect(check.type).toEqual([Pf2eMiscSkills.Flat]);
				expect(check.dc).toBe(4);
				expect(check.basic).toBeUndefined();
				expect(check.defense).toBeUndefined();
				expect(check.adjustment).toBeUndefined();
				expect(check.other).toEqual([]);
			}
		});

		test('should parse multiple skill types with DC', () => {
			const input = '@Check[arcana,occultism|dc:20]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				const check: Pf2eCheck = result.value;
				expect(check.type).toEqual([Pf2eSkills.Arcana, Pf2eSkills.Occultism]);
				expect(check.dc).toBe(20);
				expect(check.basic).toBeUndefined();
				expect(check.defense).toBeUndefined();
				expect(check.adjustment).toBeUndefined();
				expect(check.other).toEqual([]);
			}
		});

		test('should parse multiple skills with DC and adjustments', () => {
			const input = '@Check[crafting,thievery|dc:20|adjustment:0,-2]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				const check: Pf2eCheck = result.value;
				expect(check.type).toEqual([Pf2eSkills.Crafting, Pf2eSkills.Thievery]);
				expect(check.dc).toBe(20);
				expect(check.adjustment).toEqual([0, -2]);
				expect(check.basic).toBeUndefined();
				expect(check.defense).toBeUndefined();
				expect(check.other).toEqual([]);
			}
		});

		test('should parse check with defense parameter', () => {
			const input = '@Check[deception|defense:perception]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				const check: Pf2eCheck = result.value;
				expect(check.type).toEqual([Pf2eSkills.Deception]);
				expect(check.defense).toBe('perception');
				expect(check.dc).toBeUndefined();
				expect(check.basic).toBeUndefined();
				expect(check.adjustment).toBeUndefined();
				expect(check.other).toEqual([]);
			}
		});

		test('should parse check with against parameter and basic flag', () => {
			const input = '@Check[reflex|against:class-spell|basic]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				const check: Pf2eCheck = result.value;
				expect(check.type).toEqual([Pf2eMiscSkills.Reflex]);
				expect(check.basic).toBe(true);
				expect(check.dc).toBeUndefined();
				expect(check.defense).toBeUndefined();
				expect(check.adjustment).toBeUndefined();
				expect(check.other).toEqual(['against:class-spell']);
			}
		});
	});

	describe('Parameter Combinations', () => {
		test('should parse check with all parameters', () => {
			const input = '@Check[athletics,acrobatics|dc:15|traits:action:climb|defense:ac|against:spell|adjustment:2,-1|basic]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				const check: Pf2eCheck = result.value;
				expect(check.type).toEqual([Pf2eSkills.Athletics, Pf2eSkills.Acrobatics]);
				expect(check.dc).toBe(15);
				expect(check.defense).toBe('ac');
				expect(check.adjustment).toEqual([2, -1]);
				expect(check.basic).toBe(true);
				expect(check.other).toEqual(['traits:action:climb', 'against:spell']);
			}
		});

		test('should parse check with positive and negative adjustments', () => {
			const input = '@Check[stealth|dc:18|adjustment:5,-3,0,2]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				const check: Pf2eCheck = result.value;
				expect(check.type).toEqual([Pf2eSkills.Stealth]);
				expect(check.dc).toBe(18);
				expect(check.adjustment).toEqual([5, -3, 0, 2]);
			}
		});

		test('should parse check with complex traits', () => {
			const input = '@Check[medicine|dc:25|traits:action:treat-wounds:expert]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				const check: Pf2eCheck = result.value;
				expect(check.type).toEqual([Pf2eSkills.Medicine]);
				expect(check.dc).toBe(25);
				expect(check.other).toEqual(['traits:action:treat-wounds:expert']);
			}
		});
	});

	describe('Edge Cases', () => {
		test('should handle whitespace around separators', () => {
			const input = '@Check[ fortitude | dc:20 | basic ]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				const check: Pf2eCheck = result.value;
				expect(check.type).toEqual([Pf2eMiscSkills.Fortitude]);
				expect(check.dc).toBe(20);
				expect(check.basic).toBe(true);
			}
		});

		test('should handle whitespace in skill lists', () => {
			const input = '@Check[arcana, occultism, religion|dc:15]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				const check: Pf2eCheck = result.value;
				expect(check.type).toEqual([Pf2eSkills.Arcana, Pf2eSkills.Occultism, Pf2eSkills.Religion]);
				expect(check.dc).toBe(15);
			}
		});

		test('should handle high DC values', () => {
			const input = '@Check[perception|dc:999]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				const check: Pf2eCheck = result.value;
				expect(check.type).toEqual([Pf2eMiscSkills.Perception]);
				expect(check.dc).toBe(999);
			}
		});

		test('should handle escaped pipes in markdown tables', () => {
			const input = '@Check[perception\\|dc:10]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				const check: Pf2eCheck = result.value;
				expect(check.type).toEqual([Pf2eMiscSkills.Perception]);
				expect(check.dc).toBe(10);
			}
		});
	});

	describe('Invalid Input', () => {
		test('should fail on malformed input without @Check prefix', () => {
			const input = '[fortitude|dc:20]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(false);
		});

		test('should fail on malformed input without closing bracket', () => {
			const input = '@Check[fortitude|dc:20';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(false);
		});

		test('should fail on invalid skill type', () => {
			const input = '@Check[a|dc:20]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(false);
		});

		test('should fail on empty skill type', () => {
			const input = '@Check[|dc:20]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(false);
		});

		test('should fail to parse DC on invalid DC format', () => {
			const input = '@Check[fortitude|dc:abc]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.dc).toBeUndefined();
				expect(result.value.type).toEqual([Pf2eMiscSkills.Fortitude]);
				expect(result.value.other).toEqual(['dc:abc']);
			}
		});

		test('should fail to parse DC on missing colon in DC', () => {
			const input = '@Check[fortitude|dc20]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.dc).toBeUndefined();
				expect(result.value.type).toEqual([Pf2eMiscSkills.Fortitude]);
				expect(result.value.other).toEqual(['dc20']);
			}
		});

		test('should fail on invalid adjustment format', () => {
			const input = '@Check[fortitude|dc:20|adjustment:abc]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(false);
		});
	});

	describe('Parameter Order Independence', () => {
		test('should parse parameters in different order', () => {
			const input = '@Check[athletics|basic|dc:20|traits:action]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				const check: Pf2eCheck = result.value;
				expect(check.type).toEqual([Pf2eSkills.Athletics]);
				expect(check.dc).toBe(20);
				expect(check.basic).toBe(true);
				expect(check.other).toEqual(['traits:action']);
			}
		});

		test('should parse with basic flag first', () => {
			const input = '@Check[fortitude|basic|dc:20]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				const check: Pf2eCheck = result.value;
				expect(check.type).toEqual([Pf2eMiscSkills.Fortitude]);
				expect(check.dc).toBe(20);
				expect(check.basic).toBe(true);
			}
		});
	});
});

describe('PF2E Check Stringify', () => {
	describe('Basic Cases', () => {
		test.each([
			{
				description: 'basic fortitude check with DC',
				check: { type: [Pf2eMiscSkills.Fortitude], other: [], dc: 20, basic: true },
				expected: '@Check[fortitude|dc:20|basic]',
			},
			{
				description: 'flat check with DC only',
				check: { type: [Pf2eMiscSkills.Flat], other: [], dc: 4 },
				expected: '@Check[flat|dc:4]',
			},
			{
				description: 'athletics check with DC and traits',
				check: { type: [Pf2eSkills.Athletics], other: ['traits:action:long-jump'], dc: 20 },
				expected: '@Check[athletics|dc:20|traits:action:long-jump]',
			},
			{
				description: 'deception check with defense parameter',
				check: { type: [Pf2eSkills.Deception], other: [], defense: 'perception' },
				expected: '@Check[deception|defense:perception]',
			},
			{
				description: 'reflex check with against parameter and basic flag',
				check: { type: [Pf2eMiscSkills.Reflex], other: ['against:class-spell'], basic: true },
				expected: '@Check[reflex|basic|against:class-spell]',
			},
		])('should stringify $description', ({ check, expected }) => {
			expect(stringifyInlineCheck(check)).toBe(expected);
		});
	});

	describe('Multiple Skills', () => {
		test.each([
			{
				description: 'multiple skill types with DC',
				check: { type: [Pf2eSkills.Arcana, Pf2eSkills.Occultism], other: [], dc: 20 },
				expected: '@Check[arcana,occultism|dc:20]',
			},
			{
				description: 'multiple skills with DC and adjustments',
				check: { type: [Pf2eSkills.Crafting, Pf2eSkills.Thievery], other: [], dc: 20, adjustment: [0, -2] },
				expected: '@Check[crafting,thievery|dc:20|adjustment:0,-2]',
			},
			{
				description: 'check with all parameters',
				check: {
					type: [Pf2eSkills.Athletics, Pf2eSkills.Acrobatics],
					dc: 15,
					defense: 'ac',
					adjustment: [2, -1],
					basic: true,
					other: ['traits:action:climb', 'against:spell'],
				},
				expected: '@Check[athletics,acrobatics|dc:15|defense:ac|adjustment:2,-1|basic|traits:action:climb|against:spell]',
			},
		])('should stringify $description', ({ check, expected }) => {
			expect(stringifyInlineCheck(check)).toBe(expected);
		});
	});

	describe('Adjustments', () => {
		test.each([
			{
				description: 'check with positive and negative adjustments',
				check: { type: [Pf2eSkills.Stealth], other: [], dc: 18, adjustment: [5, -3, 0, 2] },
				expected: '@Check[stealth|dc:18|adjustment:5,-3,0,2]',
			},
			{
				description: 'check with positive adjustment only',
				check: { type: [Pf2eMiscSkills.Perception], other: [], adjustment: [10] },
				expected: '@Check[perception|adjustment:10]',
			},
			{
				description: 'check with negative adjustment only',
				check: { type: [Pf2eSkills.Medicine], other: [], adjustment: [-5] },
				expected: '@Check[medicine|adjustment:-5]',
			},
			{
				description: 'check with zero adjustment',
				check: { type: [Pf2eSkills.Diplomacy], other: [], adjustment: [0] },
				expected: '@Check[diplomacy]',
			},
			{
				description: 'check with multiple zero adjustments',
				check: { type: [Pf2eSkills.Diplomacy, Pf2eSkills.Deception], other: [], adjustment: [0, 0] },
				expected: '@Check[diplomacy,deception]',
			},
			{
				description: 'check with multiple adjustments',
				check: { type: [Pf2eSkills.Diplomacy, Pf2eSkills.Deception], other: [], adjustment: [0, -2] },
				expected: '@Check[diplomacy,deception|adjustment:0,-2]',
			},
		])('should stringify $description', ({ check, expected }) => {
			expect(stringifyInlineCheck(check)).toBe(expected);
		});
	});

	describe('Complex Traits', () => {
		test.each([
			{
				description: 'check with complex traits',
				check: { type: [Pf2eSkills.Medicine], other: ['traits:action:treat-wounds:expert'], dc: 25 },
				expected: '@Check[medicine|dc:25|traits:action:treat-wounds:expert]',
			},
			{
				description: 'check with multiple traits',
				check: { type: [Pf2eSkills.Survival], other: ['traits:exploration,downtime'] },
				expected: '@Check[survival|traits:exploration,downtime]',
			},
			{
				description: 'check with multiple traits and other parameters',
				check: { type: [Pf2eSkills.Intimidation], other: ['traits:emotion,fear,mental'], dc: 15, basic: true },
				expected: '@Check[intimidation|dc:15|basic|traits:emotion,fear,mental]',
			},
		])('should stringify $description', ({ check, expected }) => {
			expect(stringifyInlineCheck(check)).toBe(expected);
		});
	});

	describe('Minimal Cases', () => {
		test.each([
			{
				description: 'check with only skill type',
				check: { type: [Pf2eMiscSkills.Perception], other: [] },
				expected: '@Check[perception]',
			},
		])('should stringify $description', ({ check, expected }) => {
			expect(stringifyInlineCheck(check)).toBe(expected);
		});
	});

	describe('Round-trip Compatibility', () => {
		test.each([
			'@Check[fortitude|dc:20|basic]',
			'@Check[athletics|dc:20|traits:action:long-jump]',
			'@Check[flat|dc:4]',
			'@Check[arcana,occultism|dc:20]',
			'@Check[crafting,thievery|dc:20|adjustment:0,-2]',
			'@Check[deception|defense:perception]',
			'@Check[reflex|basic|against:class-spell]',
			'@Check[athletics,acrobatics|dc:15|defense:ac|adjustment:2,-1|basic|traits:action:climb|against:spell]',
			'@Check[stealth|dc:18|adjustment:5,-3,0,2]',
			'@Check[medicine|dc:25|traits:action:treat-wounds:expert]',
			'@Check[perception]',
		])('should round-trip parse and stringify for %p', (original: string) => {
			const parseResult = INLINE_CHECK_PARSER.tryParse(original);
			expect(parseResult.success).toBe(true);

			if (parseResult.success) {
				const stringified = stringifyInlineCheck(parseResult.value);
				const reparsed = INLINE_CHECK_PARSER.tryParse(stringified);

				expect(reparsed.success).toBe(true);
				if (reparsed.success) {
					expect(reparsed.value).toEqual(parseResult.value);
				}
			}
		});
	});
});

describe('PF2E Check Formatter', () => {
	describe('Basic Examples', () => {
		test('should format basic fortitude check', () => {
			const check: Pf2eCheck = { type: [Pf2eMiscSkills.Fortitude], other: [], dc: 20, basic: true };

			const result = formatPf2eCheck(check);
			expect(result).toBe('DC 20 Basic Fortitude');
		});

		test('should format athletics check with traits', () => {
			const check: Pf2eCheck = {
				type: [Pf2eSkills.Athletics],
				other: ['traits:action:long-jump'],
				dc: 20,
			};

			const result = formatPf2eCheck(check);
			expect(result).toBe('DC 20 Athletics');
		});

		test('should format flat check', () => {
			const check: Pf2eCheck = { type: [Pf2eMiscSkills.Flat], other: [], dc: 4 };

			const result = formatPf2eCheck(check);
			expect(result).toBe('DC 4 Flat');
		});

		test('should format multiple skill types', () => {
			const check: Pf2eCheck = { type: [Pf2eSkills.Arcana, Pf2eSkills.Occultism], other: [], dc: 20 };

			const result = formatPf2eCheck(check);
			expect(result).toBe('DC 20 Arcana or Occultism');
		});

		test('should format check single adjustment', () => {
			const check: Pf2eCheck = {
				type: [Pf2eSkills.Thievery],
				other: [],
				dc: 20,
				adjustment: [-2],
			};

			const result = formatPf2eCheck(check);
			expect(result).toBe('DC 20 Thievery (-2)');
		});

		test('should format check with adjustments', () => {
			const check: Pf2eCheck = {
				type: [Pf2eSkills.Crafting, Pf2eSkills.Thievery],
				other: [],
				dc: 20,
				adjustment: [0, -2],
			};

			const result = formatPf2eCheck(check);
			expect(result).toBe('DC 20 Crafting or Thievery (-2)');
		});

		test('should format defense check', () => {
			const check: Pf2eCheck = { type: [Pf2eSkills.Deception], other: [], defense: 'perception' };

			const result = formatPf2eCheck(check);
			expect(result).toBe('Deception vs Perception');
		});

		test('should format against check with basic', () => {
			const check: Pf2eCheck = {
				type: [Pf2eMiscSkills.Reflex],
				other: ['against:class-spell'],
				basic: true,
			};

			const result = formatPf2eCheck(check);
			expect(result).toBe('Basic Reflex');
		});
	});

	describe('Complex Combinations', () => {
		test('should format check with all parameters', () => {
			const check: Pf2eCheck = {
				type: [Pf2eSkills.Athletics, Pf2eSkills.Acrobatics],
				other: ['traits:action:climb', 'against:spell'],
				dc: 15,
				defense: 'AC',
				adjustment: [2, -1],
				basic: true,
			};

			const result = formatPf2eCheck(check);
			expect(result).toBe('DC 15 Basic Athletics (+2) or Acrobatics (-1) vs AC');
		});

		test('should format check with positive and negative adjustments', () => {
			const check: Pf2eCheck = {
				type: [Pf2eSkills.Stealth, Pf2eSkills.Survival, Pf2eMiscSkills.Perception, Pf2eSkills.Intimidation],
				other: [],
				dc: 18,
				adjustment: [5, -3, 0, 2],
			};

			const result = formatPf2eCheck(check);
			expect(result).toBe('DC 18 Stealth (+5) or Survival (-3) or Perception or Intimidation (+2)');
		});

		test('should format check with complex traits', () => {
			const check: Pf2eCheck = {
				type: [Pf2eSkills.Medicine],
				other: ['traits:action:treat-wounds:expert'],
				dc: 25,
			};

			const result = formatPf2eCheck(check);
			expect(result).toBe('DC 25 Medicine');
		});

		test('should format check with multiple traits', () => {
			const check: Pf2eCheck = {
				type: [Pf2eSkills.Survival],
				other: ['traits:exploration,downtime,concentrate'],
				dc: 15,
			};

			const result = formatPf2eCheck(check);
			expect(result).toBe('DC 15 Survival');
		});
	});

	describe('Edge Cases', () => {
		test('should handle single character skill names', () => {
			const check: Pf2eCheck = { type: ['a' as Pf2eSkills], other: [], dc: 5 };

			const result = formatPf2eCheck(check);
			expect(result).toBe('DC 5 A');
		});

		test('should handle high DC values', () => {
			const check: Pf2eCheck = { type: [Pf2eMiscSkills.Perception], other: [], dc: 999 };

			const result = formatPf2eCheck(check);
			expect(result).toBe('DC 999 Perception');
		});

		test('should handle check with only type (no DC)', () => {
			const check: Pf2eCheck = { type: [Pf2eSkills.Athletics], other: [] };

			const result = formatPf2eCheck(check);
			expect(result).toBe('Athletics');
		});

		test('should handle zero adjustments', () => {
			const check: Pf2eCheck = {
				type: [Pf2eSkills.Intimidation],
				other: [],
				dc: 12,
				adjustment: [0],
			};

			const result = formatPf2eCheck(check);
			expect(result).toBe('DC 12 Intimidation');
		});

		test('should handle negative DC (edge case)', () => {
			const check: Pf2eCheck = { type: [Pf2eSkills.Acrobatics], other: [], dc: -5 };

			const result = formatPf2eCheck(check);
			expect(result).toBe('DC -5 Acrobatics');
		});

		test('should handle three skill types', () => {
			const check: Pf2eCheck = {
				type: [Pf2eSkills.Arcana, Pf2eSkills.Occultism, Pf2eSkills.Religion],
				other: [],
				dc: 15,
			};

			const result = formatPf2eCheck(check);
			expect(result).toBe('DC 15 Arcana or Occultism or Religion');
		});

		test('should handle defense with multiple skills', () => {
			const check: Pf2eCheck = {
				type: [Pf2eSkills.Intimidation, Pf2eSkills.Diplomacy],
				other: [],
				defense: 'will',
			};
			const result = formatPf2eCheck(check);
			expect(result).toBe('Intimidation or Diplomacy vs Will');
		});

		test('should handle mixed adjustments with some zeros', () => {
			const check: Pf2eCheck = {
				type: [Pf2eSkills.Athletics, Pf2eSkills.Acrobatics, Pf2eSkills.Survival],
				other: [],
				dc: 15,
				adjustment: [3, 0, -1],
			};
			const result = formatPf2eCheck(check);
			expect(result).toBe('DC 15 Athletics (+3) or Acrobatics or Survival (-1)');
		});
	});

	describe('Error Handling', () => {
		test('should throw error when adjustment array length mismatches type array length', () => {
			const check: Pf2eCheck = {
				type: [Pf2eSkills.Athletics, Pf2eSkills.Acrobatics],
				other: [],
				dc: 15,
				adjustment: [2, -1, 3], // 3 adjustments for 2 skills
			};

			expect(() => formatPf2eCheck(check)).toThrow('Adjustment array length (3) must match type array length (2)');
		});

		test('should throw error when adjustment array is shorter than type array', () => {
			const check: Pf2eCheck = {
				type: [Pf2eSkills.Athletics, Pf2eSkills.Acrobatics, Pf2eSkills.Survival],
				other: [],
				dc: 15,
				adjustment: [2], // 1 adjustment for 3 skills
			};

			expect(() => formatPf2eCheck(check)).toThrow('Adjustment array length (1) must match type array length (3)');
		});
	});

	describe('Capitalization', () => {
		test('should properly capitalize skill names', () => {
			const check: Pf2eCheck = { type: ['FORTITUDE', 'athletics', 'lOrE'] as unknown as Pf2eSkills[], other: [], dc: 15 };
			const result = formatPf2eCheck(check);
			expect(result).toBe('DC 15 Fortitude or Athletics or Lore');
		});

		test('should properly capitalize defense names', () => {
			const check: Pf2eCheck = {
				type: [Pf2eSkills.Deception],
				other: [],
				defense: 'PERCEPTION',
			};
			const result = formatPf2eCheck(check);
			expect(result).toBe('Deception vs Perception');
		});
	});

	describe('Integration with Parser', () => {
		test('should format parsed basic check correctly', () => {
			const input = '@Check[fortitude|dc:20|basic]';
			const parseResult = INLINE_CHECK_PARSER.tryParse(input);

			expect(parseResult.success).toBe(true);
			if (parseResult.success) {
				const formatted = formatPf2eCheck(parseResult.value);
				expect(formatted).toBe('DC 20 Basic Fortitude');
			}
		});

		test('should format parsed complex check correctly', () => {
			const input = '@Check[athletics,acrobatics|dc:15|traits:action:climb|basic]';
			const parseResult = INLINE_CHECK_PARSER.tryParse(input);

			expect(parseResult.success).toBe(true);
			if (parseResult.success) {
				const formatted = formatPf2eCheck(parseResult.value);
				expect(formatted).toBe('DC 15 Basic Athletics or Acrobatics');
			}
		});

		test('should format parsed defense check correctly', () => {
			const input = '@Check[deception|defense:perception]';
			const parseResult = INLINE_CHECK_PARSER.tryParse(input);

			expect(parseResult.success).toBe(true);
			if (parseResult.success) {
				const formatted = formatPf2eCheck(parseResult.value);
				expect(formatted).toBe('Deception vs Perception');
			}
		});

		test('should format parsed adjustment check correctly', () => {
			const input = '@Check[crafting,thievery|dc:20|adjustment:0,-2]';
			const parseResult = INLINE_CHECK_PARSER.tryParse(input);

			expect(parseResult.success).toBe(true);
			if (parseResult.success) {
				const formatted = formatPf2eCheck(parseResult.value);
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
				input: '@Check[arcana,occultism|dc:20]',
				expected: 'DC 20 Arcana or Occultism',
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
				const formatted = formatPf2eCheck(parseResult.value);
				expect(formatted).toBe(expected);
			}
		});
	});
});

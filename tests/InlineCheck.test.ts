import { describe, test, expect } from 'bun:test';
import { INLINE_CHECK_PARSER, type InlineCheck, stringifyInlineCheck, GameSystem } from '../packages/obsidian/src/rolls/InlineCheck';

describe('Inline Check Parser', () => {
	describe('Example Cases', () => {
		test('should parse basic fortitude check with DC', () => {
			const input = '@Check[fortitude|dc:20|basic]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				const check: InlineCheck = result.value;
				expect(check.type).toEqual(['fortitude']);
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
				const check: InlineCheck = result.value;
				expect(check.type).toEqual(['athletics']);
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
				const check: InlineCheck = result.value;
				expect(check.type).toEqual(['flat']);
				expect(check.dc).toBe(4);
				expect(check.basic).toBeUndefined();
				expect(check.defense).toBeUndefined();
				expect(check.adjustment).toBeUndefined();
				expect(check.other).toEqual([]);
			}
		});

		test('should parse multiple skill types with DC', () => {
			const input = '@Check[arcane,occultism|dc:20]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				const check: InlineCheck = result.value;
				expect(check.type).toEqual(['arcane', 'occultism']);
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
				const check: InlineCheck = result.value;
				expect(check.type).toEqual(['crafting', 'thievery']);
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
				const check: InlineCheck = result.value;
				expect(check.type).toEqual(['deception']);
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
				const check: InlineCheck = result.value;
				expect(check.type).toEqual(['reflex']);
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
				const check: InlineCheck = result.value;
				expect(check.type).toEqual(['athletics', 'acrobatics']);
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
				const check: InlineCheck = result.value;
				expect(check.type).toEqual(['stealth']);
				expect(check.dc).toBe(18);
				expect(check.adjustment).toEqual([5, -3, 0, 2]);
			}
		});

		test('should parse check with complex traits', () => {
			const input = '@Check[medicine|dc:25|traits:action:treat-wounds:expert]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				const check: InlineCheck = result.value;
				expect(check.type).toEqual(['medicine']);
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
				const check: InlineCheck = result.value;
				expect(check.type).toEqual(['fortitude']);
				expect(check.dc).toBe(20);
				expect(check.basic).toBe(true);
			}
		});

		test('should handle whitespace in skill lists', () => {
			const input = '@Check[arcane, occultism, religion|dc:15]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				const check: InlineCheck = result.value;
				expect(check.type).toEqual(['arcane', 'occultism', 'religion']);
				expect(check.dc).toBe(15);
			}
		});

		test('should handle single character skill names', () => {
			const input = '@Check[a|dc:5]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				const check: InlineCheck = result.value;
				expect(check.type).toEqual(['a']);
				expect(check.dc).toBe(5);
			}
		});

		test('should handle high DC values', () => {
			const input = '@Check[perception|dc:999]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				const check: InlineCheck = result.value;
				expect(check.type).toEqual(['perception']);
				expect(check.dc).toBe(999);
			}
		});

		test('should handle escaped pipes in markdown tables', () => {
			const input = '@Check[perception\|dc:10]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				const check: InlineCheck = result.value;
				expect(check.type).toEqual(['perception']);
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
				expect(result.value.type).toEqual(['fortitude']);
				expect(result.value.other).toEqual(['dc:abc']);
			}
		});

		test('should fail to parse DC on missing colon in DC', () => {
			const input = '@Check[fortitude|dc20]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.dc).toBeUndefined();
				expect(result.value.type).toEqual(['fortitude']);
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
				const check: InlineCheck = result.value;
				expect(check.type).toEqual(['athletics']);
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
				const check: InlineCheck = result.value;
				expect(check.type).toEqual(['fortitude']);
				expect(check.dc).toBe(20);
				expect(check.basic).toBe(true);
			}
		});
	});
});

describe('stringifyInlineCheck', () => {
	describe('Basic Cases', () => {
		test.each([
			{
				description: 'basic fortitude check with DC',
				check: { type: ['fortitude'], system: GameSystem.PF2E, other: [], dc: 20, basic: true },
				expected: '@Check[fortitude|dc:20|basic]',
			},
			{
				description: 'flat check with DC only',
				check: { type: ['flat'], system: GameSystem.PF2E, other: [], dc: 4 },
				expected: '@Check[flat|dc:4]',
			},
			{
				description: 'athletics check with DC and traits',
				check: { type: ['athletics'], system: GameSystem.PF2E, other: ['traits:action:long-jump'], dc: 20 },
				expected: '@Check[athletics|dc:20|traits:action:long-jump]',
			},
			{
				description: 'deception check with defense parameter',
				check: { type: ['deception'], system: GameSystem.PF2E, other: [], defense: 'perception' },
				expected: '@Check[deception|defense:perception]',
			},
			{
				description: 'reflex check with against parameter and basic flag',
				check: { type: ['reflex'], system: GameSystem.PF2E, other: ['against:class-spell'], basic: true },
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
				check: { type: ['arcane', 'occultism'], system: GameSystem.PF2E, other: [], dc: 20 },
				expected: '@Check[arcane,occultism|dc:20]',
			},
			{
				description: 'multiple skills with DC and adjustments',
				check: { type: ['crafting', 'thievery'], system: GameSystem.PF2E, other: [], dc: 20, adjustment: [0, -2] },
				expected: '@Check[crafting,thievery|dc:20|adjustment:0,-2]',
			},
			{
				description: 'check with all parameters',
				check: {
					type: ['athletics', 'acrobatics'],
					system: GameSystem.PF2E,
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
				check: { type: ['stealth'], system: GameSystem.PF2E, other: [], dc: 18, adjustment: [5, -3, 0, 2] },
				expected: '@Check[stealth|dc:18|adjustment:5,-3,0,2]',
			},
			{
				description: 'check with positive adjustment only',
				check: { type: ['perception'], system: GameSystem.PF2E, other: [], adjustment: [10] },
				expected: '@Check[perception|adjustment:10]',
			},
			{
				description: 'check with negative adjustment only',
				check: { type: ['medicine'], system: GameSystem.PF2E, other: [], adjustment: [-5] },
				expected: '@Check[medicine|adjustment:-5]',
			},
			{
				description: 'check with zero adjustment',
				check: { type: ['diplomacy'], system: GameSystem.PF2E, other: [], adjustment: [0] },
				expected: '@Check[diplomacy]',
			},
			{
				description: 'check with multiple zero adjustments',
				check: { type: ['diplomacy', 'deception'], system: GameSystem.PF2E, other: [], adjustment: [0, 0] },
				expected: '@Check[diplomacy,deception]',
			},
			{
				description: 'check with multiple adjustments',
				check: { type: ['diplomacy', 'deception'], system: GameSystem.PF2E, other: [], adjustment: [0, -2] },
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
				check: { type: ['medicine'], system: GameSystem.PF2E, other: ['traits:action:treat-wounds:expert'], dc: 25 },
				expected: '@Check[medicine|dc:25|traits:action:treat-wounds:expert]',
			},
			{
				description: 'check with multiple traits',
				check: { type: ['survival'], system: GameSystem.PF2E, other: ['traits:exploration,downtime'] },
				expected: '@Check[survival|traits:exploration,downtime]',
			},
			{
				description: 'check with multiple traits and other parameters',
				check: { type: ['intimidation'], system: GameSystem.PF2E, other: ['traits:emotion,fear,mental'], dc: 15, basic: true },
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
				check: { type: ['perception'], system: GameSystem.PF2E, other: [] },
				expected: '@Check[perception]',
			},
			{
				description: 'check with single character skill name',
				check: { type: ['a'], system: GameSystem.PF2E, other: [] },
				expected: '@Check[a]',
			},
			{
				description: 'check with hyphenated skill name',
				check: { type: ['skill-with-hyphens'], system: GameSystem.PF2E, other: [] },
				expected: '@Check[skill-with-hyphens]',
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
			'@Check[arcane,occultism|dc:20]',
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

import { describe, test, expect } from 'bun:test';
import { INLINE_CHECK_PARSER, type InlineCheck } from '../packages/obsidian/src/rolls/InlineCheck';

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
				expect(check.traits).toBeUndefined();
				expect(check.defense).toBeUndefined();
				expect(check.against).toBeUndefined();
				expect(check.adjustment).toBeUndefined();
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
				expect(check.traits).toEqual(['action:long-jump']);
				expect(check.basic).toBeUndefined();
				expect(check.defense).toBeUndefined();
				expect(check.against).toBeUndefined();
				expect(check.adjustment).toBeUndefined();
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
				expect(check.traits).toBeUndefined();
				expect(check.defense).toBeUndefined();
				expect(check.against).toBeUndefined();
				expect(check.adjustment).toBeUndefined();
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
				expect(check.traits).toBeUndefined();
				expect(check.defense).toBeUndefined();
				expect(check.against).toBeUndefined();
				expect(check.adjustment).toBeUndefined();
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
				expect(check.traits).toBeUndefined();
				expect(check.defense).toBeUndefined();
				expect(check.against).toBeUndefined();
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
				expect(check.traits).toBeUndefined();
				expect(check.against).toBeUndefined();
				expect(check.adjustment).toBeUndefined();
			}
		});

		test('should parse check with against parameter and basic flag', () => {
			const input = '@Check[reflex|against:class-spell|basic]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(true);
			if (result.success) {
				const check: InlineCheck = result.value;
				expect(check.type).toEqual(['reflex']);
				expect(check.against).toBe('class-spell');
				expect(check.basic).toBe(true);
				expect(check.dc).toBeUndefined();
				expect(check.traits).toBeUndefined();
				expect(check.defense).toBeUndefined();
				expect(check.adjustment).toBeUndefined();
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
				expect(check.traits).toEqual(['action:climb']);
				expect(check.defense).toBe('ac');
				expect(check.against).toBe('spell');
				expect(check.adjustment).toEqual([2, -1]);
				expect(check.basic).toBe(true);
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
				expect(check.traits).toEqual(['action:treat-wounds:expert']);
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

		test('should fail on invalid DC format', () => {
			const input = '@Check[fortitude|dc:abc]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(false);
		});

		test('should fail on missing colon in DC', () => {
			const input = '@Check[fortitude|dc20]';
			const result = INLINE_CHECK_PARSER.tryParse(input);

			expect(result.success).toBe(false);
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
				expect(check.traits).toEqual(['action']);
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

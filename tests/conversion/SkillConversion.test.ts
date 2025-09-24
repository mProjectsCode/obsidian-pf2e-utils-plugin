import { describe, expect, test } from 'bun:test';
import { convertPf1eSkillToPf2eSkill, convertPf1eCheckToPf2eCheck } from 'packages/obsidian/src/rolls/InlineCheckConversion';
import { GameSystem } from 'packages/obsidian/src/rolls/InlineCheck';
import type { InlineCheck } from 'packages/obsidian/src/rolls/InlineCheck';

describe('convertPf1eSkillToPf2eSkill', () => {
	test('converts mapped PF1e skill to PF2e skills', () => {
		// Test a skill that maps to multiple PF2e skills
		const result = convertPf1eSkillToPf2eSkill('Appraise');
		expect(result).toEqual(['Society', 'Crafting']);
	});

	test('converts mapped PF1e skill with single mapping', () => {
		// Test a skill that maps to a single PF2e skill
		const result = convertPf1eSkillToPf2eSkill('Acrobatics');
		expect(result).toEqual(['Acrobatics']);
	});

	test('converts Knowledge skills correctly', () => {
		// Test Knowledge (arcana) -> Arcana
		const result = convertPf1eSkillToPf2eSkill('Knowledge (arcana)');
		expect(result).toEqual(['Arcana']);
	});

	test('converts Knowledge skills with multiple mappings', () => {
		// Test Knowledge (planes) -> multiple skills
		const result = convertPf1eSkillToPf2eSkill('Knowledge (planes)');
		expect(result).toEqual(['Lore', 'Arcana', 'Nature', 'Religion', 'Occultism']);
	});

	test('converts misc skills like saves', () => {
		// Test a saving throw
		const result = convertPf1eSkillToPf2eSkill('Reflex');
		expect(result).toEqual(['Reflex']);
	});

	test('converts Perception correctly', () => {
		// Test Perception (PF1e skill -> PF2e misc skill)
		const result = convertPf1eSkillToPf2eSkill('Perception');
		expect(result).toEqual(['Perception']);
	});

	test('converts complex skill mappings', () => {
		// Test Sleight of Hand -> Thievery, Deception
		const result = convertPf1eSkillToPf2eSkill('Sleight of Hand');
		expect(result).toEqual(['Thievery', 'Deception']);
	});

	test('returns input skill in array if not mapped', () => {
		// Test unmapped skill
		const result = convertPf1eSkillToPf2eSkill('UnknownSkill');
		expect(result).toEqual(['UnknownSkill']);
	});

	test('handles empty string', () => {
		const result = convertPf1eSkillToPf2eSkill('');
		expect(result).toEqual(['']);
	});

	test('returns array for all inputs', () => {
		// Ensure function always returns an array
		expect(Array.isArray(convertPf1eSkillToPf2eSkill('Diplomacy'))).toBe(true);
		expect(Array.isArray(convertPf1eSkillToPf2eSkill('NonexistentSkill'))).toBe(true);
		expect(Array.isArray(convertPf1eSkillToPf2eSkill(''))).toBe(true);
	});
});

describe('convertPf1eCheckToPf2eCheck', () => {
	test('throws error for non-PF1e check', () => {
		const pf2eCheck: InlineCheck = {
			system: GameSystem.PF2E,
			type: ['athletics'],
			dc: 15,
			other: []
		};

		expect(() => convertPf1eCheckToPf2eCheck(pf2eCheck, 5, false))
			.toThrow('Can only convert pf1e checks to pf2e checks');
	});

	test('throws error for mismatched adjustment length', () => {
		const pf1eCheck: InlineCheck = {
			system: GameSystem.PF1E,
			type: ['Climb', 'Acrobatics'],
			dc: 20,
			adjustment: [2], // Length 1, but type has length 2
			other: []
		};

		expect(() => convertPf1eCheckToPf2eCheck(pf1eCheck, 10, false))
			.toThrow('Pf1e check adjustment length must match type length');
	});

	test('converts simple single skill check', () => {
		const pf1eCheck: InlineCheck = {
			system: GameSystem.PF1E,
			type: ['Acrobatics'],
			dc: 20,
			other: []
		};

		const result = convertPf1eCheckToPf2eCheck(pf1eCheck, 10, false);

		expect(result.system).toBe(GameSystem.PF2E);
		expect(result.type).toEqual(['Acrobatics']);
		expect(result.dc).toBeDefined(); // DC conversion will depend on the conversion table
		expect(result.adjustment).toEqual([0]);
		expect(result.other).toEqual([]);
	});

	test('converts check with multiple skills', () => {
		const pf1eCheck: InlineCheck = {
			system: GameSystem.PF1E,
			type: ['Appraise', 'Perception'],
			dc: 15,
			other: []
		};

		const result = convertPf1eCheckToPf2eCheck(pf1eCheck, 8, false);

		expect(result.system).toBe(GameSystem.PF2E);
		// Appraise -> [Society, Crafting], Perception -> [Perception]
		expect(result.type).toEqual(expect.arrayContaining(['Society', 'Crafting', 'Perception']));
		expect(result.type.length).toBe(3);
		expect(result.dc).toBeDefined();
		expect(result.adjustment).toHaveLength(3);
	});

	test('converts check with adjustments', () => {
		const pf1eCheck: InlineCheck = {
			system: GameSystem.PF1E,
			type: ['Climb', 'Acrobatics'],
			dc: 18,
			adjustment: [2, -1],
			other: []
		};

		const result = convertPf1eCheckToPf2eCheck(pf1eCheck, 12, false);

		expect(result.system).toBe(GameSystem.PF2E);
		// Climb -> [Athletics], Acrobatics -> [Acrobatics]
		expect(result.type).toEqual(['Athletics', 'Acrobatics']);
		expect(result.adjustment).toEqual([2, -1]);
	});

	test('dedupes skills and keeps lowest adjustment', () => {
		const pf1eCheck: InlineCheck = {
			system: GameSystem.PF1E,
			type: ['Sleight of Hand', 'Disguise'], // Both map to Deception
			dc: 16,
			adjustment: [3, 1], // Should keep adjustment of 1 for Deception
			other: []
		};

		const result = convertPf1eCheckToPf2eCheck(pf1eCheck, 9, false);

		expect(result.system).toBe(GameSystem.PF2E);
		// Sleight of Hand -> [Thievery, Deception], Disguise -> [Deception]
		// Should dedupe Deception and keep the lower adjustment (1)
		expect(result.type).toEqual(['Thievery', 'Deception']);
		expect(result.adjustment).toEqual([3, 1]); // Thievery gets 3, Deception gets 1 (lower)
	});

	test('excludes Lore when excludeLore is true', () => {
		const pf1eCheck: InlineCheck = {
			system: GameSystem.PF1E,
			type: ['Knowledge (dungeoneering)'], // Maps to [Lore]
			dc: 18,
			other: []
		};

		const result = convertPf1eCheckToPf2eCheck(pf1eCheck, 11, true);

		expect(result.system).toBe(GameSystem.PF2E);
		expect(result.type).toEqual(['Crafting']); // Lore should be excluded
		expect(result.adjustment).toEqual([0]);
	});

	test('includes Lore when excludeLore is false', () => {
		const pf1eCheck: InlineCheck = {
			system: GameSystem.PF1E,
			type: ['Knowledge (dungeoneering)'], // Maps to [Lore]
			dc: 18,
			other: []
		};

		const result = convertPf1eCheckToPf2eCheck(pf1eCheck, 11, false);

		expect(result.system).toBe(GameSystem.PF2E);
		expect(result.type).toEqual(['Lore', 'Crafting']);
		expect(result.adjustment).toEqual([0, 0]);
	});

	test('handles check without DC', () => {
		const pf1eCheck: InlineCheck = {
			system: GameSystem.PF1E,
			type: ['Diplomacy'],
			other: []
		};

		const result = convertPf1eCheckToPf2eCheck(pf1eCheck, 7, false);

		expect(result.system).toBe(GameSystem.PF2E);
		expect(result.type).toEqual(['Diplomacy']);
		expect(result.dc).toBeUndefined();
		expect(result.adjustment).toEqual([0]);
	});

	test('handles check without adjustments', () => {
		const pf1eCheck: InlineCheck = {
			system: GameSystem.PF1E,
			type: ['Stealth', 'Survival'],
			dc: 22,
			other: []
		};

		const result = convertPf1eCheckToPf2eCheck(pf1eCheck, 15, false);

		expect(result.system).toBe(GameSystem.PF2E);
		expect(result.type).toEqual(['Stealth', 'Survival']);
		expect(result.adjustment).toEqual([0, 0]); // Default to 0 adjustments
	});

	test('converts complex Knowledge skill with multiple mappings', () => {
		const pf1eCheck: InlineCheck = {
			system: GameSystem.PF1E,
			type: ['Knowledge (planes)'], // Maps to [Lore, Arcana, Nature, Religion, Occultism]
			dc: 25,
			adjustment: [2],
			other: []
		};

		const result = convertPf1eCheckToPf2eCheck(pf1eCheck, 18, false);

		expect(result.system).toBe(GameSystem.PF2E);
		expect(result.type).toEqual(['Lore', 'Arcana', 'Nature', 'Religion', 'Occultism']);
		expect(result.adjustment).toEqual([2, 2, 2, 2, 2]); // Same adjustment for all mapped skills
	});

	test('ignores non trivially convertible attributes', () => {
		const pf1eCheck: InlineCheck = {
			system: GameSystem.PF1E,
			type: ['Intimidate'],
			dc: 14,
			basic: true,
			defense: 'will',
			other: ['trait1', 'trait2']
		};

		const result = convertPf1eCheckToPf2eCheck(pf1eCheck, 6, false);

		expect(result.system).toBe(GameSystem.PF2E);
		expect(result.type).toEqual(['Intimidation']);
		expect(result.other).toEqual([]); // Other can't be trivially mapped
		expect(result.basic).toBeUndefined(); // Basic does not exist in pf1e
		expect(result.defense).toBeUndefined(); // Defense can't be trivially mapped
	});
});
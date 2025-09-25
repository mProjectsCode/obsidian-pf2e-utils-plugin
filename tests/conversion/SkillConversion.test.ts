import { describe, expect, test } from 'bun:test';
import { convertPf1eSkillToPf2eSkill, convertPf1eCheckToPf2eCheck } from 'packages/obsidian/src/rolls/CheckConversion';
import type { Pf1eCheck } from 'packages/obsidian/src/rolls/Pf1eCheck';
import { Pf1eMiscSkills, Pf1eSkills, Pf2eMiscSkills, Pf2eSkills } from 'packages/obsidian/src/rolls/NaturalLanguageCheck';

describe('PF1E to PF2E skill conversion', () => {
	test('converts mapped PF1e skill to PF2e skills', () => {
		// Test a skill that maps to multiple PF2e skills
		const result = convertPf1eSkillToPf2eSkill(Pf1eSkills.Appraise);
		expect(result).toEqual([Pf2eSkills.Society, Pf2eSkills.Crafting]);
	});

	test('converts mapped PF1e skill with single mapping', () => {
		// Test a skill that maps to a single PF2e skill
		const result = convertPf1eSkillToPf2eSkill(Pf1eSkills.Acrobatics);
		expect(result).toEqual([Pf2eSkills.Acrobatics]);
	});

	test('converts Knowledge skills correctly', () => {
		// Test Knowledge (arcana) -> Arcana
		const result = convertPf1eSkillToPf2eSkill(Pf1eSkills.KnowledgeArcana);
		expect(result).toEqual([Pf2eSkills.Arcana]);
	});

	test('converts Knowledge skills with multiple mappings', () => {
		// Test Knowledge (planes) -> multiple skills
		const result = convertPf1eSkillToPf2eSkill(Pf1eSkills.KnowledgePlanes);
		expect(result).toEqual([Pf2eSkills.Lore, Pf2eSkills.Arcana, Pf2eSkills.Nature, Pf2eSkills.Religion, Pf2eSkills.Occultism]);
	});

	test('converts misc skills like saves', () => {
		// Test a saving throw
		const result = convertPf1eSkillToPf2eSkill(Pf1eMiscSkills.Reflex);
		expect(result).toEqual([Pf2eMiscSkills.Reflex]);
	});

	test('converts Perception correctly', () => {
		// Test Perception (PF1e skill -> PF2e misc skill)
		const result = convertPf1eSkillToPf2eSkill(Pf1eSkills.Perception);
		expect(result).toEqual([Pf2eMiscSkills.Perception]);
	});

	test('converts complex skill mappings', () => {
		// Test Sleight of Hand -> Thievery, Deception
		const result = convertPf1eSkillToPf2eSkill(Pf1eSkills.SleightOfHand);
		expect(result).toEqual([Pf2eSkills.Thievery, Pf2eSkills.Deception]);
	});

	test('returns input skill in array if not mapped', () => {
		// Test unmapped skill
		const result = convertPf1eSkillToPf2eSkill('UnknownSkill' as Pf1eSkills);
		expect(result).toEqual([]);
	});
});

describe('PF1E to PF2E check conversion', () => {
	test('does not map non-PF1e check', () => {
		const check: Pf1eCheck = {
			type: ['athletics' as Pf1eSkills],
			dc: 15,
			half: false,
		};

		const result = convertPf1eCheckToPf2eCheck(check, 5, false);

		expect(result.type).toEqual([]);
	});

	test('converts simple single skill check', () => {
		const pf1eCheck: Pf1eCheck = {
			type: [Pf1eSkills.Acrobatics],
			dc: 20,
			half: false,
		};

		const result = convertPf1eCheckToPf2eCheck(pf1eCheck, 10, false);

		expect(result.type).toEqual([Pf2eSkills.Acrobatics]);
		expect(result.dc).toBeDefined(); // DC conversion will depend on the conversion table
		expect(result.adjustment).toEqual([0]);
		expect(result.other).toEqual([]);
	});

	test('converts check with multiple skills', () => {
		const pf1eCheck: Pf1eCheck = {
			type: [Pf1eSkills.Appraise, Pf1eSkills.Perception],
			dc: 15,
			half: false,
		};

		const result = convertPf1eCheckToPf2eCheck(pf1eCheck, 8, false);

		// Appraise -> [Society, Crafting], Perception -> [Perception]
		expect(result.type).toEqual(expect.arrayContaining(['Society', 'Crafting', 'Perception']));
		expect(result.type.length).toBe(3);
		expect(result.dc).toBeDefined();
		expect(result.adjustment).toHaveLength(3);
	});

	test('excludes Lore when excludeLore is true', () => {
		const pf1eCheck: Pf1eCheck = {
			type: [Pf1eSkills.KnowledgeDungeoneering],
			dc: 18,
			half: false,
		};

		const result = convertPf1eCheckToPf2eCheck(pf1eCheck, 11, true);

		expect(result.type).toEqual([Pf2eSkills.Crafting]); // Lore should be excluded
		expect(result.adjustment).toEqual([0]);
	});

	test('includes Lore when excludeLore is false', () => {
		const pf1eCheck: Pf1eCheck = {
			type: [Pf1eSkills.KnowledgeDungeoneering],
			dc: 18,
			half: false,
		};

		const result = convertPf1eCheckToPf2eCheck(pf1eCheck, 11, false);

		expect(result.type).toEqual([Pf2eSkills.Lore, Pf2eSkills.Crafting]); // Lore should be included
		expect(result.adjustment).toEqual([0, 0]);
	});

	test('converts complex Knowledge skill with multiple mappings', () => {
		const pf1eCheck: Pf1eCheck = {
			type: [Pf1eSkills.KnowledgePlanes], // Maps to [Lore, Arcana, Nature, Religion, Occultism]
			dc: 25,
			half: false,
		};

		const result = convertPf1eCheckToPf2eCheck(pf1eCheck, 18, false);

		expect(result.type).toEqual([Pf2eSkills.Lore, Pf2eSkills.Arcana, Pf2eSkills.Nature, Pf2eSkills.Religion, Pf2eSkills.Occultism]);
		expect(result.adjustment).toEqual([0, 0, 0, 0, 0]); // Same adjustment for all mapped skills
	});

	test('ignores half property in conversion', () => {
		const pf1eCheck: Pf1eCheck = {
			type: [Pf1eMiscSkills.Reflex],
			dc: 12,
			half: true, // This property is ignored in conversion
		};

		const result = convertPf1eCheckToPf2eCheck(pf1eCheck, 3, false);

		expect(result.type).toEqual([Pf2eMiscSkills.Reflex]);
		expect(result.dc).toBeDefined();
		expect(result.adjustment).toEqual([0]);
	});
});

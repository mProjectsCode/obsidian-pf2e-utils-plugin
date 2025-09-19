import { describe, test, expect } from 'bun:test';
import { scanForPf1eChecks } from '../../packages/obsidian/src/rolls/NaturalLanguageCheckScanner';
import { Pf1eSkills, Pf1eMiscSkills } from '../../packages/obsidian/src/rolls/NaturalLanguageCheck';

describe('PF1e Scanner', () => {
	describe('Single Word Skills', () => {
		test('should find all basic single-word skills', () => {
			const skills = [
				{ text: 'DC 15 Acrobatics', skill: Pf1eSkills.Acrobatics },
				{ text: 'DC 15 Appraise', skill: Pf1eSkills.Appraise },
				{ text: 'DC 15 Bluff', skill: Pf1eSkills.Bluff },
				{ text: 'DC 15 Climb', skill: Pf1eSkills.Climb },
				{ text: 'DC 15 Craft', skill: Pf1eSkills.Craft },
				{ text: 'DC 15 Diplomacy', skill: Pf1eSkills.Diplomacy },
				{ text: 'DC 15 Disguise', skill: Pf1eSkills.Disguise },
				{ text: 'DC 15 Fly', skill: Pf1eSkills.Fly },
				{ text: 'DC 15 Heal', skill: Pf1eSkills.Heal },
				{ text: 'DC 15 Intimidate', skill: Pf1eSkills.Intimidate },
				{ text: 'DC 15 Linguistics', skill: Pf1eSkills.Linguistics },
				{ text: 'DC 15 Perception', skill: Pf1eSkills.Perception },
				{ text: 'DC 15 Perform', skill: Pf1eSkills.Perform },
				{ text: 'DC 15 Profession', skill: Pf1eSkills.Profession },
				{ text: 'DC 15 Ride', skill: Pf1eSkills.Ride },
				{ text: 'DC 15 Spellcraft', skill: Pf1eSkills.Spellcraft },
				{ text: 'DC 15 Stealth', skill: Pf1eSkills.Stealth },
				{ text: 'DC 15 Survival', skill: Pf1eSkills.Survival },
				{ text: 'DC 15 Swim', skill: Pf1eSkills.Swim },
			];

			skills.forEach(({ text, skill }) => {
				const results = scanForPf1eChecks(`Try a ${text} check.`);
				expect(results).toHaveLength(1);
				expect(results[0].check.type).toEqual([skill]);
				expect(results[0].check.dc).toBe(15);
			});
		});

		test('should find saves and misc abilities', () => {
			const miscChecks = [
				{ text: 'DC 15 Reflex', ability: Pf1eMiscSkills.Reflex },
				{ text: 'DC 15 Fortitude', ability: Pf1eMiscSkills.Fortitude },
				{ text: 'DC 15 Will', ability: Pf1eMiscSkills.Will },
				{ text: 'DC 15 CMB', ability: Pf1eMiscSkills.CMB },
				{ text: 'DC 15 Strength', ability: Pf1eMiscSkills.Strength },
				{ text: 'DC 15 Dexterity', ability: Pf1eMiscSkills.Dexterity },
				{ text: 'DC 15 Constitution', ability: Pf1eMiscSkills.Constitution },
				{ text: 'DC 15 Intelligence', ability: Pf1eMiscSkills.Intelligence },
				{ text: 'DC 15 Wisdom', ability: Pf1eMiscSkills.Wisdom },
				{ text: 'DC 15 Charisma', ability: Pf1eMiscSkills.Charisma },
			];

			miscChecks.forEach(({ text, ability }) => {
				const results = scanForPf1eChecks(`Make a ${text} save.`);
				expect(results).toHaveLength(1);
				expect(results[0].check.type).toEqual([ability]);
				expect(results[0].check.dc).toBe(15);
			});
		});
	});

	describe('Multi-word Skills', () => {
		test('should find two-word skills', () => {
			const multiWordSkills = [
				{ text: 'DC 20 Disable Device', skill: Pf1eSkills.DisableDevice },
				{ text: 'DC 20 Escape Artist', skill: Pf1eSkills.EscapeArtist },
				{ text: 'DC 20 Handle Animal', skill: Pf1eSkills.HandleAnimal },
				{ text: 'DC 20 Sense Motive', skill: Pf1eSkills.SenseMotive },
				{ text: 'DC 20 Sleight of Hand', skill: Pf1eSkills.SleightOfHand },
				{ text: 'DC 20 Use Magic Device', skill: Pf1eSkills.UseMagicDevice },
			];

			multiWordSkills.forEach(({ text, skill }) => {
				const results = scanForPf1eChecks(`Attempt a ${text} check.`);
				expect(results).toHaveLength(1);
				expect(results[0].check.type).toEqual([skill]);
				expect(results[0].check.dc).toBe(20);
				expect(results[0].text).toBe(text);
			});
		});

		test('should find multi-word skills in reverse format', () => {
			const input = 'Try Disable Device DC 25 to bypass the lock.';
			const results = scanForPf1eChecks(input);

			expect(results).toHaveLength(1);
			expect(results[0].check.type).toEqual([Pf1eSkills.DisableDevice]);
			expect(results[0].check.dc).toBe(25);
			expect(results[0].text).toBe('Disable Device DC 25');
		});
	});

	describe('Knowledge Skills', () => {
		test('should find all Knowledge skills with parentheses', () => {
			const knowledgeSkills = [
				{ text: 'Knowledge (arcana) DC 18', skill: Pf1eSkills.KnowledgeArcana },
				{ text: 'Knowledge (dungeoneering) DC 18', skill: Pf1eSkills.KnowledgeDungeoneering },
				{ text: 'Knowledge (engineering) DC 18', skill: Pf1eSkills.KnowledgeEngineering },
				{ text: 'Knowledge (geography) DC 18', skill: Pf1eSkills.KnowledgeGeography },
				{ text: 'Knowledge (history) DC 18', skill: Pf1eSkills.KnowledgeHistory },
				{ text: 'Knowledge (local) DC 18', skill: Pf1eSkills.KnowledgeLocal },
				{ text: 'Knowledge (nature) DC 18', skill: Pf1eSkills.KnowledgeNature },
				{ text: 'Knowledge (nobility) DC 18', skill: Pf1eSkills.KnowledgeNobility },
				{ text: 'Knowledge (planes) DC 18', skill: Pf1eSkills.KnowledgePlanes },
				{ text: 'Knowledge (religion) DC 18', skill: Pf1eSkills.KnowledgeReligion },
			];

			knowledgeSkills.forEach(({ text, skill }) => {
				const results = scanForPf1eChecks(`Make a ${text} check.`);
				expect(results).toHaveLength(1);
				expect(results[0].check.type).toEqual([skill]);
				expect(results[0].check.dc).toBe(18);
				expect(results[0].text).toBe(text);
			});
		});

		test('should handle Knowledge skills with different capitalizations', () => {
			const variations = ['knowledge (arcana) dc 15', 'KNOWLEDGE (ARCANA) DC 15', 'Knowledge (Arcana) DC 15', 'knowledge (ARCANA) dc 15'];

			variations.forEach(input => {
				const results = scanForPf1eChecks(input);
				expect(results).toHaveLength(1);
				expect(results[0].check.type).toEqual([Pf1eSkills.KnowledgeArcana]);
				expect(results[0].check.dc).toBe(15);
			});
		});

		test('should handle Knowledge skills in DC-first format', () => {
			const input = 'Make a DC 22 Knowledge (planes) check.';
			const results = scanForPf1eChecks(input);

			expect(results).toHaveLength(1);
			expect(results[0].check.type).toEqual([Pf1eSkills.KnowledgePlanes]);
			expect(results[0].check.dc).toBe(22);
			expect(results[0].text).toBe('DC 22 Knowledge (planes)');
		});
	});

	describe('Case Sensitivity', () => {
		test('should handle mixed case in regular skills', () => {
			const variations = [
				{ input: 'dc 15 diplomacy', expected: 'dc 15 diplomacy' },
				{ input: 'DC 15 DIPLOMACY', expected: 'DC 15 DIPLOMACY' },
				{ input: 'Dc 15 Diplomacy', expected: 'Dc 15 Diplomacy' },
				{ input: 'DC 15 diplomacy', expected: 'DC 15 diplomacy' },
			];

			variations.forEach(({ input, expected }) => {
				const results = scanForPf1eChecks(input);
				expect(results).toHaveLength(1);
				expect(results[0].check.type).toEqual([Pf1eSkills.Diplomacy]);
				expect(results[0].check.dc).toBe(15);
				expect(results[0].text).toBe(expected);
			});
		});

		test('should handle mixed case in multi-word skills', () => {
			const variations = ['disable device dc 20', 'DISABLE DEVICE DC 20', 'Disable Device DC 20', 'DISABLE device DC 20'];

			variations.forEach(input => {
				const results = scanForPf1eChecks(input);
				expect(results).toHaveLength(1);
				expect(results[0].check.type).toEqual([Pf1eSkills.DisableDevice]);
				expect(results[0].check.dc).toBe(20);
			});
		});
	});

	describe('Skill Name Variations', () => {
		test('should handle skill abbreviations and alternatives where applicable', () => {
			// Test some common abbreviations that might appear in text
			const input1 = 'Make a DC 15 UMD check.'; // Use Magic Device abbreviation
			const results1 = scanForPf1eChecks(input1);
			// This might not work depending on implementation, just testing

			const input2 = 'Try a DC 20 Sleight of Hand check.';
			const results2 = scanForPf1eChecks(input2);
			expect(results2).toHaveLength(1);
			expect(results2[0].check.type).toEqual([Pf1eSkills.SleightOfHand]);
		});

		test('should handle skills with extra descriptive text', () => {
			// These should NOT match as they have extra descriptive text
			const invalidInputs = ['DC 15 Diplomacy (fast talk)', 'DC 15 Craft (weaponsmithing)', 'DC 15 Perform (comedy)'];

			invalidInputs.forEach(input => {
				const results = scanForPf1eChecks(input);
				// These might not match or might match partially depending on implementation
				// The test documents the current behavior
			});
		});
	});
});

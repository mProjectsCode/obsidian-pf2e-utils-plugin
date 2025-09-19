import { describe, test, expect } from 'bun:test';
import { scanForPf2eChecks } from '../../packages/obsidian/src/rolls/NaturalLanguageCheckScanner';
import { Pf2eSkills, Pf2eMiscSkills } from '../../packages/obsidian/src/rolls/NaturalLanguageCheck';

describe('PF2e Scanner', () => {
	describe('Standard DC Formats', () => {
		test('should find "DC X Skill" format', () => {
			const input = 'Make a DC 15 Diplomacy check to convince the guard.';
			const results = scanForPf2eChecks(input);

			expect(results).toHaveLength(1);
			expect(results[0].check.type).toEqual([Pf2eSkills.Diplomacy]);
			expect(results[0].check.dc).toBe(15);
			expect(results[0].text).toBe('DC 15 Diplomacy');
			expect(results[0].startIndex).toBe(7);
			expect(results[0].endIndex).toBe(22);
		});

		test('should find "Skill DC X" format', () => {
			const input = 'The character needs a Stealth DC 20 check.';
			const results = scanForPf2eChecks(input);

			expect(results).toHaveLength(1);
			expect(results[0].check.type).toEqual([Pf2eSkills.Stealth]);
			expect(results[0].check.dc).toBe(20);
			expect(results[0].text).toBe('Stealth DC 20');
			expect(results[0].startIndex).toBe(22);
			expect(results[0].endIndex).toBe(35);
		});
	});

	describe('PF2e-Specific Skills', () => {
		test('should find PF2e skills that differ from PF1e', () => {
			const pf2eSpecificChecks = [
				{ text: 'DC 15 Deception', skill: Pf2eSkills.Deception },
				{ text: 'DC 15 Thievery', skill: Pf2eSkills.Thievery },
				{ text: 'DC 15 Society', skill: Pf2eSkills.Society },
				{ text: 'DC 15 Occultism', skill: Pf2eSkills.Occultism },
			];

			pf2eSpecificChecks.forEach(({ text, skill }) => {
				const results = scanForPf2eChecks(`Try a ${text} check.`);
				expect(results).toHaveLength(1);
				expect(results[0].check.type).toEqual([skill]);
				expect(results[0].check.dc).toBe(15);
			});
		});

		test('should find all PF2e skills', () => {
			const allSkills = [
				{ text: 'DC 15 Acrobatics', skill: Pf2eSkills.Acrobatics },
				{ text: 'DC 15 Arcana', skill: Pf2eSkills.Arcana },
				{ text: 'DC 15 Athletics', skill: Pf2eSkills.Athletics },
				{ text: 'DC 15 Crafting', skill: Pf2eSkills.Crafting },
				{ text: 'DC 15 Deception', skill: Pf2eSkills.Deception },
				{ text: 'DC 15 Diplomacy', skill: Pf2eSkills.Diplomacy },
				{ text: 'DC 15 Intimidation', skill: Pf2eSkills.Intimidation },
				{ text: 'DC 15 Medicine', skill: Pf2eSkills.Medicine },
				{ text: 'DC 15 Nature', skill: Pf2eSkills.Nature },
				{ text: 'DC 15 Occultism', skill: Pf2eSkills.Occultism },
				{ text: 'DC 15 Performance', skill: Pf2eSkills.Performance },
				{ text: 'DC 15 Religion', skill: Pf2eSkills.Religion },
				{ text: 'DC 15 Society', skill: Pf2eSkills.Society },
				{ text: 'DC 15 Stealth', skill: Pf2eSkills.Stealth },
				{ text: 'DC 15 Survival', skill: Pf2eSkills.Survival },
				{ text: 'DC 15 Thievery', skill: Pf2eSkills.Thievery },
			];

			allSkills.forEach(({ text, skill }) => {
				const results = scanForPf2eChecks(`Attempt a ${text} check.`);
				expect(results).toHaveLength(1);
				expect(results[0].check.type).toEqual([skill]);
				expect(results[0].check.dc).toBe(15);
			});
		});

		test('should find saves and perception', () => {
			const savesAndPerception = [
				{ text: 'DC 15 Reflex', ability: Pf2eMiscSkills.Reflex },
				{ text: 'DC 15 Fortitude', ability: Pf2eMiscSkills.Fortitude },
				{ text: 'DC 15 Will', ability: Pf2eMiscSkills.Will },
				{ text: 'DC 15 Perception', ability: Pf2eMiscSkills.Perception },
			];

			savesAndPerception.forEach(({ text, ability }) => {
				const results = scanForPf2eChecks(`Make a ${text} save.`);
				expect(results).toHaveLength(1);
				expect(results[0].check.type).toEqual([ability]);
				expect(results[0].check.dc).toBe(15);
			});
		});
	});

	describe('Multiple Checks Patterns', () => {
		test('should find multiple checks in action descriptions', () => {
			const input = 'First attempt Athletics DC 15, then if you succeed, make Acrobatics DC 20.';
			const results = scanForPf2eChecks(input);

			expect(results).toHaveLength(2);
			expect(results[0].check.type).toEqual([Pf2eSkills.Athletics]);
			expect(results[0].check.dc).toBe(15);
			expect(results[1].check.type).toEqual([Pf2eSkills.Acrobatics]);
			expect(results[1].check.dc).toBe(20);
		});

		test('should handle sequential skill challenges', () => {
			const input = 'The obstacle course requires DC 18 Athletics, DC 16 Acrobatics, and finally DC 22 Stealth.';
			const results = scanForPf2eChecks(input);

			expect(results).toHaveLength(3);
			expect(results[0].check.type).toEqual([Pf2eSkills.Athletics]);
			expect(results[1].check.type).toEqual([Pf2eSkills.Acrobatics]);
			expect(results[2].check.type).toEqual([Pf2eSkills.Stealth]);
		});
	});

	describe('Alternative and Optional Checks', () => {
		test('should handle skill alternatives with "or"', () => {
			const input = 'Make a DC 20 Diplomacy or Intimidation check.';
			const results = scanForPf2eChecks(input);

			expect(results).toHaveLength(1);
			expect(results[0].check.type).toEqual([Pf2eSkills.Diplomacy, Pf2eSkills.Intimidation]);
			expect(results[0].check.dc).toBe(20);
		});

		test('should handle three-skill alternatives', () => {
			const input = 'Try DC 25 Arcana, Occultism, or Religion to identify the symbol.';
			const results = scanForPf2eChecks(input);

			expect(results).toHaveLength(1);
			expect(results[0].check.type).toEqual([Pf2eSkills.Arcana, Pf2eSkills.Occultism, Pf2eSkills.Religion]);
			expect(results[0].check.dc).toBe(25);
		});
	});

	describe('Case Sensitivity and Formatting', () => {
		test('should handle various capitalizations', () => {
			const variations = ['dc 15 athletics', 'DC 15 ATHLETICS', 'Dc 15 Athletics', 'DC 15 athletics'];

			variations.forEach(input => {
				const results = scanForPf2eChecks(input);
				expect(results).toHaveLength(1);
				expect(results[0].check.type).toEqual([Pf2eSkills.Athletics]);
				expect(results[0].check.dc).toBe(15);
			});
		});

		test('should handle whitespace variations', () => {
			const input = 'Make   a   DC   20   Stealth   check.';
			const results = scanForPf2eChecks(input);

			expect(results).toHaveLength(1);
			expect(results[0].check.type).toEqual([Pf2eSkills.Stealth]);
			expect(results[0].check.dc).toBe(20);
		});
	});
});

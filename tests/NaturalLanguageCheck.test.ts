import { describe, test, expect } from 'bun:test';
import { parsePf1eCheck, parsePf2eCheck, Pf1eSkills, Pf1eMiscSkills, Pf2eSkills, Pf2eMiscSkills } from '../packages/obsidian/src/rolls/NaturalLanguageCheck';

describe('PF1e Natural Language Check Parser', () => {
	describe('Basic Format Tests', () => {
		test('should parse "DC X Skill" format', () => {
			const result = parsePf1eCheck('DC 15 Diplomacy');

			expect(result).not.toBeUndefined();
			if (result) {
				expect(result.type).toEqual([Pf1eSkills.Diplomacy]);
				expect(result.dc).toBe(15);
				expect(result.basic).toBeUndefined();
				expect(result.traits).toBeUndefined();
				expect(result.defense).toBeUndefined();
				expect(result.against).toBeUndefined();
				expect(result.adjustment).toBeUndefined();
			}
		});

		test('should parse "Skill DC X" format', () => {
			const result = parsePf1eCheck('Intimidate DC 9');

			expect(result).not.toBeUndefined();
			if (result) {
				expect(result.type).toEqual([Pf1eSkills.Intimidate]);
				expect(result.dc).toBe(9);
				expect(result.basic).toBeUndefined();
				expect(result.traits).toBeUndefined();
				expect(result.defense).toBeUndefined();
				expect(result.against).toBeUndefined();
				expect(result.adjustment).toBeUndefined();
			}
		});
	});

	describe('Single Skill Tests', () => {
		test('should parse basic skill checks', () => {
			const testCases = [
				{ input: 'DC 10 Climb', skill: Pf1eSkills.Climb, dc: 10 },
				{ input: 'DC 25 Perception', skill: Pf1eSkills.Perception, dc: 25 },
				{ input: 'DC 20 Disable Device', skill: Pf1eSkills.DisableDevice, dc: 20 },
				{ input: 'Disable Device DC 20', skill: Pf1eSkills.DisableDevice, dc: 20 },
			];

			testCases.forEach(({ input, skill, dc }) => {
				const result = parsePf1eCheck(input);
				expect(result).not.toBeUndefined();
				if (result) {
					expect(result.type).toEqual([skill]);
					expect(result.dc).toBe(dc);
				}
			});
		});

		test('should parse multi-word skills', () => {
			const testCases = [
				{ input: 'DC 30 Escape Artist', skill: Pf1eSkills.EscapeArtist },
				{ input: 'Handle Animal DC 15', skill: Pf1eSkills.HandleAnimal },
				{ input: 'DC 18 Sense Motive', skill: Pf1eSkills.SenseMotive },
				{ input: 'Sleight of Hand DC 22', skill: Pf1eSkills.SleightOfHand },
				{ input: 'DC 25 Use Magic Device', skill: Pf1eSkills.UseMagicDevice },
			];

			testCases.forEach(({ input, skill }) => {
				const result = parsePf1eCheck(input);
				expect(result).not.toBeUndefined();
				if (result) {
					expect(result.type).toEqual([skill]);
				}
			});
		});

		test('should parse knowledge skills', () => {
			const testCases = [
				{ input: 'DC 15 Knowledge (arcana)', skill: Pf1eSkills.KnowledgeArcana },
				{ input: 'Knowledge (nature) DC 18', skill: Pf1eSkills.KnowledgeNature },
				{ input: 'DC 20 Knowledge (history)', skill: Pf1eSkills.KnowledgeHistory },
				{ input: 'Knowledge (local) DC 12', skill: Pf1eSkills.KnowledgeLocal },
				{ input: 'DC 25 Knowledge (planes)', skill: Pf1eSkills.KnowledgePlanes },
			];

			testCases.forEach(({ input, skill }) => {
				const result = parsePf1eCheck(input);
				expect(result).not.toBeUndefined();
				if (result) {
					expect(result.type).toEqual([skill]);
				}
			});
		});

		test('should parse saves and misc skills', () => {
			const testCases = [
				{ input: 'DC 12 Reflex', skill: Pf1eMiscSkills.Reflex },
				{ input: 'Fortitude DC 18', skill: Pf1eMiscSkills.Fortitude },
				{ input: 'DC 15 Will', skill: Pf1eMiscSkills.Will },
				{ input: 'CMB DC 20', skill: Pf1eMiscSkills.CMB },
			];

			testCases.forEach(({ input, skill }) => {
				const result = parsePf1eCheck(input);
				expect(result).not.toBeUndefined();
				if (result) {
					expect(result.type).toEqual([skill]);
				}
			});
		});
	});

	describe('Multiple Skills Tests', () => {
		test('should parse skills with "or" separator', () => {
			const result = parsePf1eCheck('DC 15 Linguistics or Knowledge (arcana)');

			expect(result).not.toBeUndefined();
			if (result) {
				expect(result.type).toEqual([Pf1eSkills.Linguistics, Pf1eSkills.KnowledgeArcana]);
				expect(result.dc).toBe(15);
			}
		});

		test('should parse skills with ", or" separator', () => {
			const result = parsePf1eCheck('DC 18 Knowledge (nature), or Knowledge (religion)');

			expect(result).not.toBeUndefined();
			if (result) {
				expect(result.type).toEqual([Pf1eSkills.KnowledgeNature, Pf1eSkills.KnowledgeReligion]);
				expect(result.dc).toBe(18);
			}
		});

		test('should parse three skills with mixed separators', () => {
			const result = parsePf1eCheck('DC 20 Knowledge (history), Knowledge (local), or Knowledge (planes)');

			expect(result).not.toBeUndefined();
			if (result) {
				expect(result.type).toEqual([Pf1eSkills.KnowledgeHistory, Pf1eSkills.KnowledgeLocal, Pf1eSkills.KnowledgePlanes]);
				expect(result.dc).toBe(20);
			}
		});

		test('should parse skills with comma separator', () => {
			const result = parsePf1eCheck('DC 22 Stealth, Disable Device');

			expect(result).not.toBeUndefined();
			if (result) {
				expect(result.type).toEqual([Pf1eSkills.Stealth, Pf1eSkills.DisableDevice]);
				expect(result.dc).toBe(22);
			}
		});
	});

	describe('Case Insensitive Tests', () => {
		test('should handle different capitalizations', () => {
			const testCases = ['dc 15 diplomacy', 'DC 15 DIPLOMACY', 'Dc 15 Diplomacy', 'DC 15 diplomacy', 'dc 15 DIPLOMACY'];

			testCases.forEach(input => {
				const result = parsePf1eCheck(input);
				expect(result).not.toBeUndefined();
				if (result) {
					expect(result.type).toEqual([Pf1eSkills.Diplomacy]);
					expect(result.dc).toBe(15);
				}
			});
		});

		test('should handle case insensitive knowledge skills', () => {
			const testCases = ['DC 15 knowledge (arcana)', 'DC 15 KNOWLEDGE (ARCANA)', 'DC 15 Knowledge (Arcana)', 'dc 15 knowledge (ARCANA)'];

			testCases.forEach(input => {
				const result = parsePf1eCheck(input);
				expect(result).not.toBeUndefined();
				if (result) {
					expect(result.type).toEqual([Pf1eSkills.KnowledgeArcana]);
					expect(result.dc).toBe(15);
				}
			});
		});
	});

	describe('Edge Cases and Error Handling', () => {
		test('should handle extra whitespace', () => {
			const result = parsePf1eCheck('  DC   15   Diplomacy  ');

			expect(result).not.toBeUndefined();
			if (result) {
				expect(result.type).toEqual([Pf1eSkills.Diplomacy]);
				expect(result.dc).toBe(15);
			}
		});

		test('should handle high DC values', () => {
			const result = parsePf1eCheck('DC 999 Climb');

			expect(result).not.toBeUndefined();
			if (result) {
				expect(result.type).toEqual([Pf1eSkills.Climb]);
				expect(result.dc).toBe(999);
			}
		});

		test('should return null for invalid input', () => {
			const invalidInputs = ['', 'Invalid input', 'DC Diplomacy', '15 Diplomacy', 'DC abc Diplomacy', 'DC 15', 'Diplomacy'];

			invalidInputs.forEach(input => {
				const result = parsePf1eCheck(input);
				expect(result).toBeUndefined();
			});
		});

		test('should handle unknown skills as errors', () => {
			const result = parsePf1eCheck('DC 15 UnknownSkill');

			expect(result).toBeUndefined();
		});
	});

	describe('Complete Example Tests', () => {
		test('should parse all single skill example cases from comments', () => {
			const examples = [
				{ input: 'DC 10 Climb', expectedType: [Pf1eSkills.Climb], expectedDC: 10 },
				{ input: 'DC 30 Escape Artist', expectedType: [Pf1eSkills.EscapeArtist], expectedDC: 30 },
				{ input: 'Disable Device DC 20', expectedType: [Pf1eSkills.DisableDevice], expectedDC: 20 },
				{ input: 'DC 15 Diplomacy', expectedType: [Pf1eSkills.Diplomacy], expectedDC: 15 },
				{ input: 'DC 25 Perception', expectedType: [Pf1eSkills.Perception], expectedDC: 25 },
				{ input: 'DC 20 Disable Device', expectedType: [Pf1eSkills.DisableDevice], expectedDC: 20 },
				{ input: 'Intimidate DC 9', expectedType: [Pf1eSkills.Intimidate], expectedDC: 9 },
				{ input: 'DC 12 Reflex', expectedType: [Pf1eMiscSkills.Reflex], expectedDC: 12 },
				// Multi-skill examples temporarily excluded until multi-skill parsing is fixed:
				{
					input: 'DC 15 Linguistics or Knowledge (arcana)',
					expectedType: [Pf1eSkills.Linguistics, Pf1eSkills.KnowledgeArcana],
					expectedDC: 15,
				},
				{
					input: 'DC 18 Knowledge (nature) or Knowledge (religion)',
					expectedType: [Pf1eSkills.KnowledgeNature, Pf1eSkills.KnowledgeReligion],
					expectedDC: 18,
				},
				{
					input: 'DC 20 Knowledge (history), Knowledge (local), or Knowledge (planes)',
					expectedType: [Pf1eSkills.KnowledgeHistory, Pf1eSkills.KnowledgeLocal, Pf1eSkills.KnowledgePlanes],
					expectedDC: 20,
				},
			];

			examples.forEach(({ input, expectedType, expectedDC }) => {
				const result = parsePf1eCheck(input);
				expect(result).not.toBeUndefined();
				if (result) {
					expect(result.type).toEqual(expectedType);
					expect(result.dc).toBe(expectedDC);
				}
			});
		});
	});
});

describe('PF2e Natural Language Check Parser', () => {
	describe('Basic Format Tests', () => {
		test('should parse "DC X Skill" format', () => {
			const result = parsePf2eCheck('DC 15 Deception');

			expect(result).not.toBeUndefined();
			if (result) {
				expect(result.type).toEqual([Pf2eSkills.Deception]);
				expect(result.dc).toBe(15);
				expect(result.basic).toBeUndefined();
				expect(result.traits).toBeUndefined();
				expect(result.defense).toBeUndefined();
				expect(result.against).toBeUndefined();
				expect(result.adjustment).toBeUndefined();
			}
		});

		test('should parse "Skill DC X" format', () => {
			const result = parsePf2eCheck('Athletics DC 20');

			expect(result).not.toBeUndefined();
			if (result) {
				expect(result.type).toEqual([Pf2eSkills.Athletics]);
				expect(result.dc).toBe(20);
				expect(result.basic).toBeUndefined();
				expect(result.traits).toBeUndefined();
				expect(result.defense).toBeUndefined();
				expect(result.against).toBeUndefined();
				expect(result.adjustment).toBeUndefined();
			}
		});
	});

	describe('Single Skill Tests', () => {
		test('should parse basic skill checks', () => {
			const testCases = [
				{ input: 'DC 10 Athletics', skill: Pf2eSkills.Athletics, dc: 10 },
				{ input: 'DC 25 Perception', skill: Pf2eMiscSkills.Perception, dc: 25 },
				{ input: 'DC 20 Thievery', skill: Pf2eSkills.Thievery, dc: 20 },
				{ input: 'Crafting DC 18', skill: Pf2eSkills.Crafting, dc: 18 },
			];

			testCases.forEach(({ input, skill, dc }) => {
				const result = parsePf2eCheck(input);
				expect(result).not.toBeUndefined();
				if (result) {
					expect(result.type).toEqual([skill]);
					expect(result.dc).toBe(dc);
				}
			});
		});

		test('should parse all PF2e skills', () => {
			const testCases = [
				{ input: 'DC 15 Acrobatics', skill: Pf2eSkills.Acrobatics },
				{ input: 'DC 15 Arcana', skill: Pf2eSkills.Arcana },
				{ input: 'DC 15 Athletics', skill: Pf2eSkills.Athletics },
				{ input: 'DC 15 Crafting', skill: Pf2eSkills.Crafting },
				{ input: 'DC 15 Deception', skill: Pf2eSkills.Deception },
				{ input: 'DC 15 Diplomacy', skill: Pf2eSkills.Diplomacy },
				{ input: 'DC 15 Intimidation', skill: Pf2eSkills.Intimidation },
				{ input: 'DC 15 Lore', skill: Pf2eSkills.Lore },
				{ input: 'DC 15 Medicine', skill: Pf2eSkills.Medicine },
				{ input: 'DC 15 Nature', skill: Pf2eSkills.Nature },
				{ input: 'DC 15 Occultism', skill: Pf2eSkills.Occultism },
				{ input: 'DC 15 Performance', skill: Pf2eSkills.Performance },
				{ input: 'DC 15 Religion', skill: Pf2eSkills.Religion },
				{ input: 'DC 15 Society', skill: Pf2eSkills.Society },
				{ input: 'DC 15 Stealth', skill: Pf2eSkills.Stealth },
				{ input: 'DC 15 Survival', skill: Pf2eSkills.Survival },
				{ input: 'DC 15 Thievery', skill: Pf2eSkills.Thievery },
			];

			testCases.forEach(({ input, skill }) => {
				const result = parsePf2eCheck(input);
				expect(result).not.toBeUndefined();
				if (result) {
					expect(result.type).toEqual([skill]);
				}
			});
		});

		test('should parse saves and misc skills', () => {
			const testCases = [
				{ input: 'DC 12 Reflex', skill: Pf2eMiscSkills.Reflex },
				{ input: 'Fortitude DC 18', skill: Pf2eMiscSkills.Fortitude },
				{ input: 'DC 15 Will', skill: Pf2eMiscSkills.Will },
				{ input: 'Perception DC 22', skill: Pf2eMiscSkills.Perception },
			];

			testCases.forEach(({ input, skill }) => {
				const result = parsePf2eCheck(input);
				expect(result).not.toBeUndefined();
				if (result) {
					expect(result.type).toEqual([skill]);
				}
			});
		});
	});

	describe('Multiple Skills Tests', () => {
		test('should parse skills with ", or" separator', () => {
			const result = parsePf2eCheck('DC 18 Arcana, or Occultism');

			expect(result).not.toBeUndefined();
			if (result) {
				expect(result.type).toEqual([Pf2eSkills.Arcana, Pf2eSkills.Occultism]);
				expect(result.dc).toBe(18);
			}
		});

		test('should parse three skills with mixed separators', () => {
			const result = parsePf2eCheck('DC 20 Arcana, Nature, or Religion');

			expect(result).not.toBeUndefined();
			if (result) {
				expect(result.type).toEqual([Pf2eSkills.Arcana, Pf2eSkills.Nature, Pf2eSkills.Religion]);
				expect(result.dc).toBe(20);
			}
		});
	});

	describe('Case Insensitive Tests', () => {
		test('should handle different capitalizations', () => {
			const testCases = ['dc 15 deception', 'DC 15 DECEPTION', 'Dc 15 Deception', 'DC 15 deception', 'dc 15 DECEPTION'];

			testCases.forEach(input => {
				const result = parsePf2eCheck(input);
				expect(result).not.toBeUndefined();
				if (result) {
					expect(result.type).toEqual([Pf2eSkills.Deception]);
					expect(result.dc).toBe(15);
				}
			});
		});
	});

	describe('Edge Cases and Error Handling', () => {
		test('should handle extra whitespace', () => {
			const result = parsePf2eCheck('  DC   15   Deception  ');

			expect(result).not.toBeUndefined();
			if (result) {
				expect(result.type).toEqual([Pf2eSkills.Deception]);
				expect(result.dc).toBe(15);
			}
		});

		test('should handle high DC values', () => {
			const result = parsePf2eCheck('DC 999 Athletics');

			expect(result).not.toBeUndefined();
			if (result) {
				expect(result.type).toEqual([Pf2eSkills.Athletics]);
				expect(result.dc).toBe(999);
			}
		});

		test('should return undefined for invalid input', () => {
			const invalidInputs = ['', 'Invalid input', 'DC Deception', '15 Deception', 'DC abc Deception'];

			invalidInputs.forEach(input => {
				const result = parsePf2eCheck(input);
				expect(result).toBeUndefined();
			});
		});

		test('should handle unknown skills gracefully', () => {
			const result = parsePf2eCheck('DC 15 UnknownSkill');

			expect(result).toBeUndefined();
		});
	});

	describe('Complete Example Tests', () => {
		test('should parse all example cases', () => {
			const examples = [
				{ input: 'DC 10 Athletics', expectedType: [Pf2eSkills.Athletics], expectedDC: 10 },
				{ input: 'DC 15 Deception', expectedType: [Pf2eSkills.Deception], expectedDC: 15 },
				{ input: 'Medicine DC 20', expectedType: [Pf2eSkills.Medicine], expectedDC: 20 },
				{ input: 'DC 25 Thievery', expectedType: [Pf2eSkills.Thievery], expectedDC: 25 },
				{ input: 'DC 22 Perception', expectedType: [Pf2eMiscSkills.Perception], expectedDC: 22 },
				{ input: 'Crafting DC 18', expectedType: [Pf2eSkills.Crafting], expectedDC: 18 },
				{ input: 'DC 12 Reflex', expectedType: [Pf2eMiscSkills.Reflex], expectedDC: 12 },
				{
					input: 'DC 18 Arcana, or Occultism',
					expectedType: [Pf2eSkills.Arcana, Pf2eSkills.Occultism],
					expectedDC: 18,
				},
				{
					input: 'DC 20 Arcana, Nature, or Religion',
					expectedType: [Pf2eSkills.Arcana, Pf2eSkills.Nature, Pf2eSkills.Religion],
					expectedDC: 20,
				},
			];

			examples.forEach(({ input, expectedType, expectedDC }) => {
				const result = parsePf2eCheck(input);
				expect(result).not.toBeUndefined();
				if (result) {
					expect(result.type).toEqual(expectedType);
					expect(result.dc).toBe(expectedDC);
				}
			});
		});
	});
});

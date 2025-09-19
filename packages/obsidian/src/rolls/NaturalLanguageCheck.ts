import type { Parser } from '@lemons_dev/parsinom/lib/Parser';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import type { InlineCheck } from 'packages/obsidian/src/rolls/InlineCheck';

// We want to parse natural language checks like would appear in pathfinder source material
// This should work for both pf1e and pf2e skill checks

export enum Pf1eSkills {
	Acrobatics = 'Acrobatics',
	Appraise = 'Appraise',
	Bluff = 'Bluff',
	Climb = 'Climb',
	Craft = 'Craft',
	Diplomacy = 'Diplomacy',
	DisableDevice = 'Disable Device',
	Disguise = 'Disguise',
	EscapeArtist = 'Escape Artist',
	Fly = 'Fly',
	HandleAnimal = 'Handle Animal',
	Heal = 'Heal',
	Intimidate = 'Intimidate',
	KnowledgeArcana = 'Knowledge (arcana)',
	KnowledgeDungeoneering = 'Knowledge (dungeoneering)',
	KnowledgeEngineering = 'Knowledge (engineering)',
	KnowledgeGeography = 'Knowledge (geography)',
	KnowledgeHistory = 'Knowledge (history)',
	KnowledgeLocal = 'Knowledge (local)',
	KnowledgeNature = 'Knowledge (nature)',
	KnowledgeNobility = 'Knowledge (nobility)',
	KnowledgePlanes = 'Knowledge (planes)',
	KnowledgeReligion = 'Knowledge (religion)',
	Linguistics = 'Linguistics',
	Perception = 'Perception',
	Perform = 'Perform',
	Profession = 'Profession',
	Ride = 'Ride',
	SenseMotive = 'Sense Motive',
	SleightOfHand = 'Sleight of Hand',
	Spellcraft = 'Spellcraft',
	Stealth = 'Stealth',
	Survival = 'Survival',
	Swim = 'Swim',
	UseMagicDevice = 'Use Magic Device',
}

export enum Pf1eMiscSkills {
	Reflex = 'Reflex',
	Fortitude = 'Fortitude',
	Will = 'Will',
	CMB = 'CMB',
	Strength = 'Strength',
	Dexterity = 'Dexterity',
	Constitution = 'Constitution',
	Intelligence = 'Intelligence',
	Wisdom = 'Wisdom',
	Charisma = 'Charisma',
}

export enum Pf2eSkills {
	Acrobatics = 'Acrobatics',
	Arcana = 'Arcana',
	Athletics = 'Athletics',
	Crafting = 'Crafting',
	Deception = 'Deception',
	Diplomacy = 'Diplomacy',
	Intimidation = 'Intimidation',
	Lore = 'Lore',
	Medicine = 'Medicine',
	Nature = 'Nature',
	Occultism = 'Occultism',
	Performance = 'Performance',
	Religion = 'Religion',
	Society = 'Society',
	Stealth = 'Stealth',
	Survival = 'Survival',
	Thievery = 'Thievery',
}

export enum Pf2eMiscSkills {
	Reflex = 'Reflex',
	Fortitude = 'Fortitude',
	Will = 'Will',
	Perception = 'Perception',
}

// ============================================================================
// Parameterized Parser Factory Functions
// ============================================================================

/**
 * Creates a DC parser that parses "DC X" format and returns the numeric value
 */
function createDcParser(): Parser<number> {
	return P.sequenceMap((_, dc) => parseInt(dc), P.string('dc').trim(P_UTILS.optionalWhitespace()), P_UTILS.digits());
}

/**
 * Creates a skill name parser from the provided skill enums
 */
function createSkillNameParser(...skillEnums: Record<string, string>[]): Parser<string> {
	const allSkills = skillEnums.flatMap(enumObj => Object.values(enumObj));
	return P.or(...allSkills.map(value => P.string(value.toLowerCase()).result(value)));
}

/**
 * Creates a skills list parser that handles multiple skills separated by various delimiters
 */
function createSkillsListParser(skillNameParser: Parser<string>): Parser<string[]> {
	// Parser for skill separators
	const skillSeparatorParser = P.or(
		P.sequence(P_UTILS.whitespace(), P.string('or'), P_UTILS.whitespace()),
		P.sequence(P_UTILS.optionalWhitespace(), P.string(', or'), P_UTILS.whitespace()),
		P.sequence(P_UTILS.optionalWhitespace(), P.string(','), P_UTILS.optionalWhitespace()),
	);

	return P.separateByNotEmpty(skillNameParser, skillSeparatorParser);
}

/**
 * Creates a complete natural language check parser for both "DC X Skill" and "Skill DC X" formats
 */
function createNaturalLanguageParser(skillsListParser: Parser<string[]>, dcParser: Parser<number>): Parser<InlineCheck> {
	// Parser for "DC X Skill" format
	const dcFirstParser: Parser<InlineCheck> = P.sequenceMap(
		(dc, skills) => ({
			type: skills,
			dc: dc,
		}),
		dcParser.trim(P_UTILS.optionalWhitespace()),
		skillsListParser,
	);

	// Parser for "Skill DC X" format
	const skillFirstParser: Parser<InlineCheck> = P.sequenceMap(
		(skills, dc) => ({
			type: skills,
			dc: dc,
		}),
		skillsListParser.trim(P_UTILS.optionalWhitespace()),
		dcParser,
	);

	return P.or(dcFirstParser, skillFirstParser);
}

// ============================================================================
// PF1e Parser Implementation
// ============================================================================

// Examples for pf1e formatting:
// DC 10 Climb
// DC 30 Escape Artist
// Disable Device DC 20
// DC 15 Diplomacy
// DC 25 Perception
// DC 20 Disable Device
// Intimidate DC 9
// DC 12 Reflex
// DC 15 Linguistics or Knowledge (arcana)
// DC 18 Knowledge (nature) or Knowledge (religion)
// DC 20 Knowledge (history), Knowledge (local), or Knowledge (planes)

// PF1e Parser Implementation using factory functions
const PF1E_SKILL_NAME_PARSER = createSkillNameParser(Pf1eSkills, Pf1eMiscSkills);
const PF1E_SKILLS_LIST_PARSER = createSkillsListParser(PF1E_SKILL_NAME_PARSER);
const PF1E_DC_PARSER = createDcParser();

export const PF1E_NATURAL_LANGUAGE_PARSER: Parser<InlineCheck> = createNaturalLanguageParser(PF1E_SKILLS_LIST_PARSER, PF1E_DC_PARSER);

/**
 * Parses a PF1e natural language skill check string into an InlineCheck object
 *
 * @param input The natural language check string (e.g., "DC 15 Diplomacy", "Intimidate DC 9")
 * @returns An InlineCheck object or undefined if parsing fails
 */
export function parsePf1eCheck(input: string): InlineCheck | undefined {
	const lowerInput = input.toLowerCase();
	return PF1E_NATURAL_LANGUAGE_PARSER.tryParse(lowerInput).value;
}

// ============================================================================
// PF2e Parser Implementation
// ============================================================================

// Examples for pf2e formatting (similar patterns to pf1e):
// DC 10 Athletics
// DC 15 Deception
// Medicine DC 20
// DC 25 Thievery
// DC 18 Arcana or Occultism
// DC 22 Crafting, Thievery
// DC 15 Arcana, Nature, or Religion

// PF2e Parser Implementation using factory functions
const PF2E_SKILL_NAME_PARSER = createSkillNameParser(Pf2eSkills, Pf2eMiscSkills);
const PF2E_SKILLS_LIST_PARSER = createSkillsListParser(PF2E_SKILL_NAME_PARSER);
const PF2E_DC_PARSER = createDcParser();

export const PF2E_NATURAL_LANGUAGE_PARSER: Parser<InlineCheck> = createNaturalLanguageParser(PF2E_SKILLS_LIST_PARSER, PF2E_DC_PARSER);

/**
 * Parses a PF2e natural language skill check string into an InlineCheck object
 *
 * @param input The natural language check string (e.g., "DC 15 Deception", "Athletics DC 20")
 * @returns An InlineCheck object or undefined if parsing fails
 */
export function parsePf2eCheck(input: string): InlineCheck | undefined {
	const lowerInput = input.toLowerCase();
	return PF2E_NATURAL_LANGUAGE_PARSER.tryParse(lowerInput).value;
}

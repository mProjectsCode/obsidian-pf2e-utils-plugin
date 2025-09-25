import type { Parser } from '@lemons_dev/parsinom/lib/Parser';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import type { Pf1eCheck } from 'packages/obsidian/src/rolls/Pf1eCheck';
import type { Pf2eCheck } from 'packages/obsidian/src/rolls/Pf2eCheck';

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
	CasterLevel = 'Caster Level',
}

export const ALL_PF1E_SKILLS = [...Object.values(Pf1eSkills), ...Object.values(Pf1eMiscSkills)];

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
	SpellAttack = 'Spell Attack',
	Flat = 'Flat',
}

export const ALL_PF2E_SKILLS = [...Object.values(Pf2eSkills), ...Object.values(Pf2eMiscSkills)];

export const PF1E_TO_PF2E_SKILL_MAP: Record<Pf1eSkills | Pf1eMiscSkills, (Pf2eSkills | Pf2eMiscSkills)[]> = {
	[Pf1eSkills.Acrobatics]: [Pf2eSkills.Acrobatics],
	[Pf1eSkills.Appraise]: [Pf2eSkills.Society, Pf2eSkills.Crafting],
	[Pf1eSkills.Bluff]: [Pf2eSkills.Deception],
	[Pf1eSkills.Climb]: [Pf2eSkills.Athletics],
	[Pf1eSkills.Craft]: [Pf2eSkills.Crafting],
	[Pf1eSkills.Diplomacy]: [Pf2eSkills.Diplomacy],
	[Pf1eSkills.DisableDevice]: [Pf2eSkills.Thievery],
	[Pf1eSkills.Disguise]: [Pf2eSkills.Deception],
	[Pf1eSkills.EscapeArtist]: [Pf2eSkills.Thievery],
	[Pf1eSkills.Fly]: [Pf2eSkills.Acrobatics],
	[Pf1eSkills.HandleAnimal]: [Pf2eSkills.Nature],
	[Pf1eSkills.Heal]: [Pf2eSkills.Medicine],
	[Pf1eSkills.Intimidate]: [Pf2eSkills.Intimidation],
	[Pf1eSkills.KnowledgeArcana]: [Pf2eSkills.Arcana],
	[Pf1eSkills.KnowledgeDungeoneering]: [Pf2eSkills.Lore, Pf2eSkills.Crafting],
	[Pf1eSkills.KnowledgeEngineering]: [Pf2eSkills.Lore, Pf2eSkills.Crafting],
	[Pf1eSkills.KnowledgeGeography]: [Pf2eSkills.Lore, Pf2eSkills.Nature],
	[Pf1eSkills.KnowledgeHistory]: [Pf2eSkills.Lore, Pf2eSkills.Society],
	[Pf1eSkills.KnowledgeLocal]: [Pf2eSkills.Lore, Pf2eSkills.Society],
	[Pf1eSkills.KnowledgeNature]: [Pf2eSkills.Lore, Pf2eSkills.Nature],
	[Pf1eSkills.KnowledgeNobility]: [Pf2eSkills.Lore, Pf2eSkills.Society],
	[Pf1eSkills.KnowledgePlanes]: [Pf2eSkills.Lore, Pf2eSkills.Arcana, Pf2eSkills.Nature, Pf2eSkills.Religion, Pf2eSkills.Occultism],
	[Pf1eSkills.KnowledgeReligion]: [Pf2eSkills.Lore, Pf2eSkills.Religion],
	[Pf1eSkills.Linguistics]: [Pf2eSkills.Lore, Pf2eSkills.Society],
	[Pf1eSkills.Perception]: [Pf2eMiscSkills.Perception],
	[Pf1eSkills.Perform]: [Pf2eSkills.Performance],
	[Pf1eSkills.Profession]: [Pf2eSkills.Crafting],
	[Pf1eSkills.Ride]: [Pf2eSkills.Nature],
	[Pf1eSkills.SenseMotive]: [Pf2eMiscSkills.Perception],
	[Pf1eSkills.SleightOfHand]: [Pf2eSkills.Thievery, Pf2eSkills.Deception],
	[Pf1eSkills.Spellcraft]: [Pf2eSkills.Arcana],
	[Pf1eSkills.Stealth]: [Pf2eSkills.Stealth],
	[Pf1eSkills.Survival]: [Pf2eSkills.Survival],
	[Pf1eSkills.Swim]: [Pf2eSkills.Athletics],
	[Pf1eSkills.UseMagicDevice]: [Pf2eSkills.Arcana],

	[Pf1eMiscSkills.Reflex]: [Pf2eMiscSkills.Reflex],
	[Pf1eMiscSkills.Fortitude]: [Pf2eMiscSkills.Fortitude],
	[Pf1eMiscSkills.Will]: [Pf2eMiscSkills.Will],
	[Pf1eMiscSkills.CMB]: [Pf2eSkills.Athletics, Pf2eSkills.Acrobatics],
	[Pf1eMiscSkills.Strength]: [Pf2eSkills.Athletics],
	[Pf1eMiscSkills.Dexterity]: [Pf2eSkills.Acrobatics, Pf2eSkills.Stealth, Pf2eSkills.Thievery],
	[Pf1eMiscSkills.Constitution]: [Pf2eMiscSkills.Fortitude],
	[Pf1eMiscSkills.Intelligence]: [Pf2eSkills.Arcana, Pf2eSkills.Crafting, Pf2eSkills.Lore, Pf2eSkills.Occultism, Pf2eSkills.Society],
	[Pf1eMiscSkills.Wisdom]: [Pf2eSkills.Medicine, Pf2eSkills.Nature, Pf2eSkills.Religion, Pf2eSkills.Survival],
	[Pf1eMiscSkills.Charisma]: [Pf2eSkills.Deception, Pf2eSkills.Diplomacy, Pf2eSkills.Intimidation, Pf2eSkills.Performance],
	[Pf1eMiscSkills.CasterLevel]: [Pf2eMiscSkills.SpellAttack],
};

// ============================================================================
// Skill Alternative Mappings
// ============================================================================

/**
 * Maps skill abbreviations and alternative names to their canonical skill names
 */
export const PF1E_SKILL_ALTERNATIVES: Record<string, Pf1eSkills | Pf1eMiscSkills> = {
	// Common abbreviations
	umd: Pf1eSkills.UseMagicDevice,
	dd: Pf1eSkills.DisableDevice,
	ea: Pf1eSkills.EscapeArtist,
	ha: Pf1eSkills.HandleAnimal,
	sm: Pf1eSkills.SenseMotive,
	soh: Pf1eSkills.SleightOfHand,

	// Knowledge skill alternatives
	'knowledge arcana': Pf1eSkills.KnowledgeArcana,
	'knowledge dungeoneering': Pf1eSkills.KnowledgeDungeoneering,
	'knowledge engineering': Pf1eSkills.KnowledgeEngineering,
	'knowledge geography': Pf1eSkills.KnowledgeGeography,
	'knowledge history': Pf1eSkills.KnowledgeHistory,
	'knowledge local': Pf1eSkills.KnowledgeLocal,
	'knowledge nature': Pf1eSkills.KnowledgeNature,
	'knowledge nobility': Pf1eSkills.KnowledgeNobility,
	'knowledge planes': Pf1eSkills.KnowledgePlanes,
	'knowledge religion': Pf1eSkills.KnowledgeReligion,
};

export const PF1E_KNOWLEDGE_SKILL_MAP: Record<string, Pf1eSkills> = {
	arcana: Pf1eSkills.KnowledgeArcana,
	dungeoneering: Pf1eSkills.KnowledgeDungeoneering,
	engineering: Pf1eSkills.KnowledgeEngineering,
	geography: Pf1eSkills.KnowledgeGeography,
	history: Pf1eSkills.KnowledgeHistory,
	local: Pf1eSkills.KnowledgeLocal,
	nature: Pf1eSkills.KnowledgeNature,
	nobility: Pf1eSkills.KnowledgeNobility,
	planes: Pf1eSkills.KnowledgePlanes,
	religion: Pf1eSkills.KnowledgeReligion,
};

export const PF2E_SKILL_ALTERNATIVES: Record<string, Pf2eSkills | Pf2eMiscSkills> = {
	// Common abbreviations (PF2e has simpler skill names)
	ath: Pf2eSkills.Athletics,
	acr: Pf2eSkills.Acrobatics,
	dec: Pf2eSkills.Deception,
	dip: Pf2eSkills.Diplomacy,
	int: Pf2eSkills.Intimidation,
	med: Pf2eSkills.Medicine,
	occ: Pf2eSkills.Occultism,
	perf: Pf2eSkills.Performance,
	rel: Pf2eSkills.Religion,
	soc: Pf2eSkills.Society,
	sur: Pf2eSkills.Survival,
	thi: Pf2eSkills.Thievery,
	per: Pf2eMiscSkills.Perception,
};

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
 * Creates a skill name parser from the provided skill enums and alternatives mapping
 */
function createSkillNameParser<T extends string>(skillAlternatives: Record<string, T>, ...skillEnums: Record<string, T>[]): Parser<T> {
	const allSkills = skillEnums.flatMap(enumObj => Object.values(enumObj));
	const allAlternatives = Object.keys(skillAlternatives);

	// Create parsers for all skill names and alternatives
	const skillParsers = allSkills.map(value => P.string(value.toLowerCase()).result(value));
	const alternativeParsers = allAlternatives.map(alternative => P.string(alternative.toLowerCase()).result(skillAlternatives[alternative]));

	return P.or(...skillParsers, ...alternativeParsers);
}

export type MaybeArray<T> = T | T[];

/**
 * Creates a skills list parser that handles multiple skills separated by various delimiters
 */
function createSkillsListParser<T extends string>(skillNameParser: Parser<MaybeArray<T>>): Parser<T[]> {
	// Parser for skill separators
	const skillSeparatorParser = P.or(
		P.sequence(P_UTILS.whitespace(), P.string('or'), P_UTILS.whitespace()),
		P.sequence(P_UTILS.optionalWhitespace(), P.string(', or'), P_UTILS.whitespace()),
		P.sequence(P_UTILS.optionalWhitespace(), P.string(','), P_UTILS.optionalWhitespace()),
	);

	return P.separateByNotEmpty(skillNameParser, skillSeparatorParser).map(skills => {
		const arr = [];
		for (const skill of skills) {
			if (Array.isArray(skill)) {
				arr.push(...skill);
			} else {
				arr.push(skill);
			}
		}
		return arr;
	});
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
// DC 25 Knowledge (arcana or planes)
// DC 25 Knowledge (arcana, planes, or religion)
// DC 20 caster level
// Reflex DC 15 half

function createPf1eSkillListParser(): Parser<(Pf1eSkills | Pf1eMiscSkills)[]> {
	const knowledgeShortParser = createSkillsListParser(
		P.or(...Object.entries(PF1E_KNOWLEDGE_SKILL_MAP).map(([key, value]) => P.string(key.toLowerCase()).result(value))),
	);
	const knowledgeParser = P.sequenceMap(
		(_1, _2, skills) => skills,
		P.string('knowledge'),
		P_UTILS.optionalWhitespace(),
		knowledgeShortParser.trim(P_UTILS.optionalWhitespace()).wrapString('(', ')'),
	);
	const skillAlternativeParser = P.or(...Object.entries(PF1E_SKILL_ALTERNATIVES).map(([key, value]) => P.string(key.toLowerCase()).result(value)));
	const otherSkillParser = [Pf1eSkills, Pf1eMiscSkills]
		.flatMap(enumObj => Object.values(enumObj) as (Pf1eSkills | Pf1eMiscSkills)[])
		.filter(skill => !skill.startsWith('Knowledge'));
	const skillNameParser = P.or(knowledgeParser, ...otherSkillParser.map(skill => P.string(skill.toLowerCase()).result(skill)), skillAlternativeParser);

	return createSkillsListParser(skillNameParser);
}

function createPf1eNaturalLanguageParser(): Parser<Pf1eCheck> {
	const skillListParser = createPf1eSkillListParser();
	const dcParser = createDcParser();
	const halfParser = P.string('half')
		.trim(P_UTILS.optionalWhitespace())
		.optional()
		.map(x => !!x);

	// Parser for "DC X Skill" format
	const dcFirstParser: Parser<Pf1eCheck> = P.sequenceMap(
		(dc, skills, half) =>
			({
				type: skills,
				dc: dc,
				half: half,
			}) satisfies Pf1eCheck,
		dcParser.trim(P_UTILS.optionalWhitespace()),
		skillListParser,
		halfParser,
	);

	// Parser for "Skill DC X" format
	const skillFirstParser: Parser<Pf1eCheck> = P.sequenceMap(
		(skills, dc, half) =>
			({
				type: skills,
				dc: dc,
				half: half,
			}) satisfies Pf1eCheck,
		skillListParser.trim(P_UTILS.optionalWhitespace()),
		dcParser,
		halfParser,
	);

	return P.or(dcFirstParser, skillFirstParser);
}

export const PF1E_NATURAL_LANGUAGE_PARSER: Parser<Pf1eCheck> = createPf1eNaturalLanguageParser();

/**
 * Parses a PF1e natural language skill check string into an InlineCheck object
 *
 * @param input The natural language check string (e.g., "DC 15 Diplomacy", "Intimidate DC 9")
 * @returns An InlineCheck object or undefined if parsing fails
 */
export function parsePf1eCheck(input: string): Pf1eCheck | undefined {
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

function createPf2eNaturalLanguageParser(): Parser<Pf2eCheck> {
	const skillNameParser = createSkillNameParser(PF2E_SKILL_ALTERNATIVES, Pf2eSkills, Pf2eMiscSkills);
	const skillListParser = createSkillsListParser(skillNameParser);
	const dcParser = createDcParser();

	// Parser for "DC X Skill" format
	const dcFirstParser: Parser<Pf2eCheck> = P.sequenceMap(
		(dc, skills) => ({
			type: skills,
			dc: dc,
			other: [],
		}),
		dcParser.trim(P_UTILS.optionalWhitespace()),
		skillListParser,
	);

	// Parser for "Skill DC X" format
	const skillFirstParser: Parser<Pf2eCheck> = P.sequenceMap(
		(skills, dc) => ({
			type: skills,
			dc: dc,
			other: [],
		}),
		skillListParser.trim(P_UTILS.optionalWhitespace()),
		dcParser,
	);

	return P.or(dcFirstParser, skillFirstParser);
}

export const PF2E_NATURAL_LANGUAGE_PARSER: Parser<Pf2eCheck> = createPf2eNaturalLanguageParser();

/**
 * Parses a PF2e natural language skill check string into an InlineCheck object
 *
 * @param input The natural language check string (e.g., "DC 15 Deception", "Athletics DC 20")
 * @returns An InlineCheck object or undefined if parsing fails
 */
export function parsePf2eCheck(input: string): Pf2eCheck | undefined {
	const lowerInput = input.toLowerCase();
	return PF2E_NATURAL_LANGUAGE_PARSER.tryParse(lowerInput).value;
}

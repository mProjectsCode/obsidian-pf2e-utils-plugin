import type { Parser } from '@lemons_dev/parsinom/lib/Parser';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';

// We want to parse foundryvtt pf2e inline checks like `@Check[fortitude|dc:20|basic]`
// https://github.com/foundryvtt/pf2e/wiki/Style-Guide#inline-check-links

// Examples:
// @Check[fortitude|dc:20|basic]
// @Check[athletics|dc:20|traits:action:long-jump]
// @Check[flat|dc:4]
// @Check[arcane,occultism|dc:20]
// @Check[crafting,thievery|dc:20|adjustment:0,-2]
// @Check[deception|defense:perception]
// @Check[reflex|against:class-spell|basic]

export enum GameSystem {
	PF1E = 'pf1e',
	PF2E = 'pf2e',
}

export interface InlineCheck {
	system: GameSystem;
	type: string[];
	dc?: number;
	traits?: string[];
	defense?: string;
	against?: string;
	adjustment?: number[];
	basic?: boolean;
}

const IDENTIFIER_PARSER = P.oneOf('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_')
	.atLeast(1)
	.map(x => x.join(''));

const TYPE_PARSER = P.separateByNotEmpty(IDENTIFIER_PARSER, P.string(',').trim(P_UTILS.optionalWhitespace()));

const DC_PARSER: Parser<Pick<InlineCheck, 'dc'>> = P.sequenceMap(
	(_1, num) => ({ dc: Number(num) }),
	P.string('dc:').trim(P_UTILS.optionalWhitespace()),
	P_UTILS.digits(),
);

const TRAITS_PARSER: Parser<Pick<InlineCheck, 'traits'>> = P.sequenceMap(
	(_1, traits) => ({ traits }),
	P.string('traits:').trim(P_UTILS.optionalWhitespace()),
	P.separateBy(P.manyNotOf('|],'), P.string(',').trim(P_UTILS.optionalWhitespace())),
);

const DEFENSE_PARSER: Parser<Pick<InlineCheck, 'defense'>> = P.sequenceMap(
	(_1, defense) => ({ defense }),
	P.string('defense:').trim(P_UTILS.optionalWhitespace()),
	IDENTIFIER_PARSER,
);

const AGAINST_PARSER: Parser<Pick<InlineCheck, 'against'>> = P.sequenceMap(
	(_1, against) => ({ against }),
	P.string('against:').trim(P_UTILS.optionalWhitespace()),
	IDENTIFIER_PARSER,
);

const BASIC_PARSER: Parser<Pick<InlineCheck, 'basic'>> = P.string('basic').result({ basic: true });

const ADJUSTMENT_PARSER: Parser<Pick<InlineCheck, 'adjustment'>> = P.sequenceMap(
	(_1, nums) => ({ adjustment: nums }),
	P.string('adjustment:').trim(P_UTILS.optionalWhitespace()),
	P.separateBy(
		P.sequenceMap((sign, digits) => Number((sign ?? '') + digits), P.string('-').optional(), P_UTILS.digits()),
		P.string(',').trim(P_UTILS.optionalWhitespace()),
	),
);

const INLINE_CHECK_INNER_PARSER = P.sequenceMap(
	(type, rest) => {
		const res = { type, system: GameSystem.PF2E };
		for (const part of rest) {
			Object.assign(res, part);
		}
		return res as InlineCheck;
	},
	TYPE_PARSER.trim(P_UTILS.optionalWhitespace()),
	P.sequenceMap(
		(_sep, part) => part,
		P.string('|').trim(P_UTILS.optionalWhitespace()),
		P.or(DC_PARSER, TRAITS_PARSER, DEFENSE_PARSER, AGAINST_PARSER, ADJUSTMENT_PARSER, BASIC_PARSER),
	).many(),
);

export const INLINE_CHECK_PARSER = P.sequenceMap(
	(_1, inner, _2) => inner,
	P.string('@Check['),
	INLINE_CHECK_INNER_PARSER.trim(P_UTILS.optionalWhitespace()),
	P.string(']'),
);

/**
 * Converts an InlineCheck object to a human-readable string format.
 *
 * @param check The InlineCheck object to format
 * @returns A human-readable string representation
 * @throws Error if adjustment array length doesn't match type array length
 *
 * @example
 * // Basic check: "DC 20 Basic Fortitude"
 * formatInlineCheck({ type: ['fortitude'], dc: 20, basic: true })
 *
 * // Multiple skills with adjustments: "DC 20 Crafting or Thievery (-2)"
 * formatInlineCheck({ type: ['crafting', 'thievery'], dc: 20, adjustment: [0, -2] })
 *
 * // Defense check: "Deception vs Perception"
 * formatInlineCheck({ type: ['deception'], defense: 'perception' })
 */
export function formatInlineCheck(check: InlineCheck): string {
	const parts: string[] = [];

	// Add DC if present
	if (check.dc !== undefined) {
		parts.push(`DC ${check.dc}`);
	}

	// Add basic flag
	if (check.basic) {
		parts.push('Basic');
	}

	// Add skill types with adjustments
	const skillNames = check.type.map(skill => skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase());

	// Validate adjustment array length if present
	if (check.adjustment && check.adjustment.length !== check.type.length) {
		throw new Error(`Adjustment array length (${check.adjustment.length}) must match type array length (${check.type.length})`);
	}

	if (skillNames.length === 1) {
		let skillPart = skillNames[0];

		// Add adjustment if present and not zero
		if (check.adjustment && check.adjustment[0] !== 0) {
			const adj = check.adjustment[0];
			skillPart += ` (${adj >= 0 ? '+' : ''}${adj})`;
		}

		parts.push(skillPart);
	} else {
		const skillParts = skillNames.map((skill, index) => {
			let skillPart = skill;

			// Add adjustment if present and not zero
			if (check.adjustment && check.adjustment[index] !== 0) {
				const adj = check.adjustment[index];
				skillPart += ` (${adj >= 0 ? '+' : ''}${adj})`;
			}

			return skillPart;
		});

		parts.push(skillParts.join(' or '));
	}

	// Add defense if present
	if (check.defense) {
		const capitalizedDefense = check.defense.charAt(0).toUpperCase() + check.defense.slice(1).toLowerCase();
		parts.push(`vs ${capitalizedDefense}`);
	}

	// Add against if present
	if (check.against) {
		parts.push(`against ${check.against}`);
	}

	// Add traits if present
	if (check.traits && check.traits.length > 0) {
		const traitsStr = check.traits.join(', ');
		parts.push(`[${traitsStr}]`);
	}

	return parts.join(' ');
}

/**
 * Turns the InlineCheck object into a foundryvtt pf2e inline check string.
 *
 * @param check The InlineCheck object to convert to string format
 * @returns A foundryvtt pf2e inline check string like "@Check[fortitude|dc:20|basic]"
 *
 * @example
 * // Basic check: "@Check[fortitude|dc:20|basic]"
 * stringifyInlineCheck({ type: ['fortitude'], dc: 20, basic: true, system: GameSystem.PF2E })
 *
 * // Multiple skills: "@Check[crafting,thievery|dc:20|adjustment:0,-2]"
 * stringifyInlineCheck({ type: ['crafting', 'thievery'], dc: 20, adjustment: [0, -2], system: GameSystem.PF2E })
 */
export function stringifyInlineCheck(check: InlineCheck): string {
	const parts: string[] = [];

	// Start with the type(s)
	parts.push(check.type.join(','));

	// Add DC if present
	if (check.dc !== undefined) {
		parts.push(`dc:${check.dc}`);
	}

	// Add traits if present
	if (check.traits && check.traits.length > 0) {
		parts.push(`traits:${check.traits.join(',')}`);
	}

	// Add defense if present
	if (check.defense) {
		parts.push(`defense:${check.defense}`);
	}

	// Add against if present
	if (check.against) {
		parts.push(`against:${check.against}`);
	}

	// Add adjustment if present
	if (check.adjustment && check.adjustment.length > 0 && !check.adjustment.every(adj => adj === 0)) {
		const adjustmentStr = check.adjustment.map(String).join(',');
		parts.push(`adjustment:${adjustmentStr}`);
	}

	// Add basic flag if present
	if (check.basic) {
		parts.push('basic');
	}

	return `@Check[${parts.join('|')}]`;
}

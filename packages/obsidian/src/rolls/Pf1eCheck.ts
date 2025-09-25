import type { Pf1eMiscSkills, Pf1eSkills } from 'packages/obsidian/src/rolls/NaturalLanguageCheck';

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

export interface Pf1eCheck {
	type: (Pf1eSkills | Pf1eMiscSkills)[];
	dc: number;
	half: boolean;
}

export function formatPf1eCheck(check: Pf1eCheck): string {
	const parts: string[] = [];

	parts.push(`DC ${check.dc}`);

	// Add skill types with adjustments
	parts.push(...check.type.map(skill => skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase()));

	// Add half flag
	if (check.half) {
		parts.push('Half');
	}

	return parts.join(' ');
}

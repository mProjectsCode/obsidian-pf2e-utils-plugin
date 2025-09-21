<script lang="ts">
	import { formatInlineCheck, GameSystem, stringifyInlineCheck, type InlineCheck } from '../rolls/InlineCheck';
	import { getPf2eCheckClassification, pf2eLevelBasedDC } from '../rolls/InlineCheckConversion';
	import { ALL_PF2E_SKILLS, Pf2eMiscSkills } from '../rolls/NaturalLanguageCheck';
	import { ButtonStyleType } from '../utils/misc';
	import Button from './common/Button.svelte';
	import FlexRow from './common/FlexRow.svelte';
	import SettingComponent from './common/SettingComponent.svelte';

	const {
		onCancel,
		onSubmit,
		prefillCheck,
		level,
	}: {
		onCancel: () => void;
		onSubmit: (check: InlineCheck) => void;
		prefillCheck?: InlineCheck | undefined;
		level: number;
	} = $props();

	let types: {
		type: string;
		adjustment: number | undefined;
	}[] = $state(prefillCheck?.type.map((t, i) => ({ type: t, adjustment: prefillCheck?.adjustment?.[i] ?? 0 })) ?? [{ type: '', adjustment: 0 }]);

	let dc: number | undefined | null = $state(prefillCheck?.dc ?? null);

	let traits: string = $state('');

	// defense and DC are mutually exclusive
	let defense: string | undefined = $state(prefillCheck?.defense ?? undefined);

	let basic: boolean = $state(true);

	let check: InlineCheck | undefined = $derived.by(() => {
		if (error) {
			return undefined;
		}

		const basicEligible = types.some(t => t.type === Pf2eMiscSkills.Fortitude || t.type === Pf2eMiscSkills.Reflex || t.type === Pf2eMiscSkills.Will);

		return {
			system: GameSystem.PF2E,
			type: types.map(t => t.type),
			adjustment: types.map(t => t.adjustment ?? 0),
			traits: traits
				.split(',')
				.map(t => t.trim())
				.filter(t => t.length > 0),
			dc: dc ?? undefined,
			defense: defense,
			basic: basicEligible && basic,
		};
	});

	let error: string | undefined = $derived.by(() => {
		if (types.length === 0) {
			return 'At least one check type is required';
		}
		if (types.some(t => t.type.trim().length === 0)) {
			return 'All check types must be filled out';
		}
		if (types.some(t => t.adjustment && isNaN(t.adjustment))) {
			return 'All adjustments must be valid numbers';
		}
		if (dc == null && (defense === undefined || defense.trim().length === 0)) {
			return 'Either DC or Defense must be filled out';
		}
		if (dc != null && defense !== undefined && defense.trim().length > 0) {
			return 'Only one of DC or Defense can be filled out';
		}
		if (dc != null && isNaN(dc)) {
			return 'DC must be a valid number';
		}

		return undefined;
	});
</script>

<div>
	<p>Pf2e level: {level}</p>
	<p>Level based DC: {pf2eLevelBasedDC(level)}</p>

	<SettingComponent heading={true} name="Check Types"></SettingComponent>

	<div class="pf2e-settings-stack">
		{#each types as type, i}
			<FlexRow stretchChildren={true}>
				<select class="dropdown" bind:value={type.type}>
					{#each ALL_PF2E_SKILLS as skill}
						<option value={skill}>{skill}</option>
					{/each}
					<option value="">None</option>
				</select>
				<input type="number" bind:value={type.adjustment} placeholder="Adjustment" />
				<Button
					variant={ButtonStyleType.DESTRUCTIVE}
					onclick={() => {
						types.splice(i, 1);
					}}
					disabled={types.length <= 1}>Remove</Button
				>
			</FlexRow>
		{/each}

		<Button
			variant={ButtonStyleType.PRIMARY}
			onclick={() => {
				types.push({ type: '', adjustment: 0 });
			}}>Add Check Type</Button
		>
	</div>

	<SettingComponent name="DC" description="The difficulty class for the check.">
		<input type="number" bind:value={dc} placeholder="DC" />
	</SettingComponent>

	<SettingComponent name="Traits" description="Optional traits for the check, comma separated.">
		<input type="text" bind:value={traits} placeholder="Traits" />
	</SettingComponent>

	<SettingComponent name="Defense" description="The defense to check against (e.g. fortitude, perception, ...).">
		<input type="text" bind:value={defense} placeholder="Defense" />
	</SettingComponent>

	<SettingComponent name="Basic Check" description="Whether this is a basic save. Only applies to saves.">
		<input type="checkbox" bind:checked={basic} />
	</SettingComponent>

	<SettingComponent heading={true} name="Preview"></SettingComponent>

	{#if error}
		<p class="mod-warning">{error}</p>
	{:else if check}
		<p>{stringifyInlineCheck(check)}</p>
		<p>{formatInlineCheck(check)}</p>
		<p>{getPf2eCheckClassification(check, level)}</p>
	{:else}
		<p class="mod-warning">Check is invalid</p>
	{/if}

	<div class="pf2e-button-row">
		<Button variant={ButtonStyleType.DESTRUCTIVE} onclick={() => onCancel()}>Cancel</Button>
		<Button
			variant={ButtonStyleType.PRIMARY}
			onclick={() => {
				if (check) {
					onSubmit(check);
				}
			}}
			disabled={!check}>Submit</Button
		>
	</div>
</div>

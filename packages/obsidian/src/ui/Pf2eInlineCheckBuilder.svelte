<script lang="ts">
	import { formatPf2eCheck, stringifyPf2eCheck, type Pf2eCheck } from '../rolls/Pf2eCheck';
	import { getPf2eCheckClassification, pf2eLevelBasedDC } from '../rolls/CheckConversion';
	import { ALL_PF2E_SKILLS, Pf2eMiscSkills, Pf2eSkills } from '../rolls/NaturalLanguageCheck';
	import { ButtonStyleType } from '../utils/misc';
	import Button from './common/Button.svelte';
	import FlexRow from './common/FlexRow.svelte';
	import SettingComponent from './common/SettingComponent.svelte';

	interface CheckTypeOption {
		type: Pf2eSkills | Pf2eMiscSkills | undefined | null;
		adjustment: number | undefined | null;
	}

	interface FullCheckTypeOption {
		type: Pf2eSkills | Pf2eMiscSkills;
		adjustment: number | undefined | null;
	}

	const {
		onCancel,
		onSubmit,
		prefillCheck,
		level,
		submitLabel = 'Submit',
	}: {
		onCancel: () => void;
		onSubmit: (check: Pf2eCheck) => void;
		prefillCheck?: Pf2eCheck | undefined;
		level: number | undefined;
		submitLabel: string | undefined;
	} = $props();

	let types: CheckTypeOption[] = $state(getInitialTypes());
	let dc: number | undefined | null = $state(prefillCheck?.dc ?? null);
	let other: string = $state(prefillCheck?.other?.join('|') ?? '');
	let defense: string = $state(prefillCheck?.defense ?? '');
	let basic: boolean = $state(prefillCheck?.basic ?? true);

	let check: Pf2eCheck | undefined = $derived.by(() => {
		if (error) {
			return undefined;
		}

		const filteredTypes = types.filter(t => t.type != null) as FullCheckTypeOption[];

		const basicEligible = filteredTypes.some(
			t => t.type === Pf2eMiscSkills.Fortitude || t.type === Pf2eMiscSkills.Reflex || t.type === Pf2eMiscSkills.Will,
		);

		return {
			type: filteredTypes.map(t => t.type),
			adjustment: filteredTypes.map(t => t.adjustment ?? 0),
			dc: dc ?? undefined,
			defense: defense !== '' ? defense : undefined,
			basic: basicEligible && basic,
			other: other
				.split('|')
				.map(t => t.trim())
				.filter(t => t.length > 0),
		};
	});

	let error: string | undefined = $derived.by(() => {
		if (types.length === 0) {
			return 'At least one check type is required';
		}
		if (types.some(t => t.type == null)) {
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

	function getInitialTypes(): CheckTypeOption[] {
		if (prefillCheck?.type) {
			return prefillCheck.type.map((t, i) => ({
				type: t,
				adjustment: prefillCheck?.adjustment?.[i] ?? 0,
			}));
		} else {
			return [
				{
					type: undefined,
					adjustment: 0,
				},
			];
		}
	}
</script>

<div>
	{#if level !== undefined}
		<p>Pf2e level: {level}</p>
		<p>Level based DC: {pf2eLevelBasedDC(level)}</p>
	{/if}

	<SettingComponent heading={true} name="Check Types"></SettingComponent>

	<div class="pf2e-settings-stack">
		{#each types as type, i}
			<FlexRow stretchChildren={true}>
				<select class="dropdown" bind:value={type.type}>
					{#each ALL_PF2E_SKILLS as skill}
						<option value={skill}>{skill}</option>
					{/each}
					<option value={undefined}>None</option>
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
				types.push({ type: undefined, adjustment: 0 });
			}}>Add Check Type</Button
		>
	</div>

	<SettingComponent name="DC" description="The difficulty class for the check.">
		<input type="number" bind:value={dc} placeholder="DC" />
	</SettingComponent>

	<SettingComponent name="Defense" description="The defense to check against (e.g. fortitude, perception, ...).">
		<input type="text" bind:value={defense} placeholder="Defense" />
	</SettingComponent>

	<SettingComponent name="Basic Check" description="Whether this is a basic save. Only applies to saves.">
		<input type="checkbox" bind:checked={basic} />
	</SettingComponent>

	<SettingComponent name="Other" description="Optional other attributes for the check, separated by '|'. E.g. 'traits:fire|showDC'">
		<input type="text" bind:value={other} placeholder="Other" />
	</SettingComponent>

	<SettingComponent heading={true} name="Preview"></SettingComponent>

	{#if error}
		<p class="mod-warning">{error}</p>
	{:else if check}
		<p>{stringifyPf2eCheck(check)}</p>
		<p>{formatPf2eCheck(check)}</p>
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
			disabled={!check}>{submitLabel}</Button
		>
	</div>
</div>

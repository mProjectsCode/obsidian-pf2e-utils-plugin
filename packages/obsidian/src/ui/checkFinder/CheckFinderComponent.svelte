<script lang="ts" generics="System extends GameSystem">
	import { Notice, TFile, type EventRef } from 'obsidian';
	import CheckHighlight from './CheckHighlight.svelte';
	import { CheckFinderView } from './CheckFinderView';
	import type { CheckScanResult } from '../../rolls/NaturalLanguageCheckScanner';
	import { FilePrompt } from '../modals/FilePrompt';
	import { openLevelUpdateModal } from '../modals/LevelUpdateModal';
	import Button from '../common/Button.svelte';
	import { ButtonStyleType } from '../../utils/misc';
	import SettingComponent from '../common/SettingComponent.svelte';
	import { onDestroy, untrack } from 'svelte';
	import { GameSystem } from '../../rolls/Pf2eCheck';

	const {
		view,
	}: {
		view: CheckFinderView<System>;
	} = $props();

	let checks: CheckScanResult<System>[] = $state([]);
	let locked: boolean = $state(false);
	let file: TFile | undefined = $state(undefined);
	let level: number | undefined = $state(undefined);

	let resultMessage = $derived.by(() => {
		if (locked) {
			return 'Working...';
		} else if (file === undefined) {
			return 'No file selected';
		} else if (level === undefined) {
			return 'No level set';
		} else {
			return `${checks.length} checks found`;
		}
	});

	async function withLocked<T>(fn: () => Promise<T>): Promise<T> {
		locked = true;
		try {
			return await fn();
		} finally {
			locked = false;
		}
	}

	async function transformCheck(check: CheckScanResult<System>) {
		await withLocked(async () => {
			if (!file) {
				return;
			}

			// for security, re-fetch the level
			level = view.plugin.getLevelFromFrontmatter(file);
			if (level === undefined) {
				return;
			}

			if (await view.checkFinder.convertCheck(check, file, level)) {
				checks = checks.filter(m => m !== check);
				await findChecks();
			} else {
				new Notice('Failed to transform check');
			}
		});
	}

	async function findChecks() {
		if (!file || level === undefined) {
			return;
		}
		const content = await view.plugin.app.vault.cachedRead(file);
		checks = (await view.checkFinder.findChecks(content)) as CheckScanResult<System>[];
	}

	function selectFile() {
		new FilePrompt(view.plugin.app, async f => {
			await withLocked(async () => {
				file = f;
				level = view.plugin.getLevelFromFrontmatter(f);
				checks = [];

				if (level !== undefined) {
					await findChecks();
				}
			});
		}).open();
	}

	async function updateLevel() {
		await withLocked(async () => {
			if (!file) {
				return;
			}

			await openLevelUpdateModal(view.plugin, file);
		});
	}

	let metadataRef: EventRef | undefined = undefined;

	$effect(() => {
		const currentFile = file;

		untrack(() => {
			if (metadataRef) {
				view.app.metadataCache.offref(metadataRef);
			}
			metadataRef = view.app.metadataCache.on('changed', async (changedFile, _, cache) => {
				if (currentFile?.path === changedFile.path) {
					const newLevel = (cache?.frontmatter as Record<string, unknown>)?.level;
					const parsedLevel = view.plugin.parseLevel(newLevel);

					if (parsedLevel !== level) {
						await withLocked(async () => {
							level = parsedLevel;
							await findChecks();
						});
					}
				}
			});
		});
	});

	onDestroy(() => {
		if (metadataRef) {
			view.app.metadataCache.offref(metadataRef);
		}
	});
</script>

<h1>{view.getDisplayText()}</h1>

<SettingComponent name="Selected file" description="The markdown file to search for checks.">
	{#if file}
		<span>{file.path}</span>
	{:else}
		<span>No file selected</span>
	{/if}
	<Button variant={ButtonStyleType.PRIMARY} onclick={() => selectFile()} disabled={locked}>Change file</Button>
</SettingComponent>

<SettingComponent name="Level" description="The level to use translating DCs.">
	{#if level !== undefined}
		<span>{level}</span>
	{:else}
		<span class="mod-warning">No level set</span>
	{/if}
	<Button variant={ButtonStyleType.PRIMARY} onclick={() => updateLevel()} disabled={locked || !file}>Change level</Button>
</SettingComponent>

<SettingComponent name="Search" description={resultMessage}>
	<Button variant={ButtonStyleType.PRIMARY} onclick={() => findChecks()} disabled={locked || !file || level === undefined}>Rerun search</Button>
</SettingComponent>

{#if checks.length > 0}
	<table style="width: 100%">
		<thead>
			<tr>
				<th>Check</th>
				<th>Transform</th>
			</tr>
		</thead>
		<tbody>
			{#each checks.slice(0, 100) as result, i}
				<tr>
					<td><CheckHighlight bind:check={checks[i]}></CheckHighlight></td>
					<td>
						<button onclick={() => void transformCheck(result)} disabled={locked}>
							{view.checkFinder.formatCheck(result.check)}
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

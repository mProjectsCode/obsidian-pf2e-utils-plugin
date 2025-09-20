<script lang="ts">
	import { Notice, TFile } from 'obsidian';
	import CheckHighlight from './CheckHighlight.svelte';
	import { CheckFinderView } from './CheckFinderView';
	import type { CheckScanResult } from '../rolls/NaturalLanguageCheckScanner';
	import { formatInlineCheck } from '../rolls/InlineCheck';
	import { FilePrompt } from './FilePrompt';

	const {
		view,
	}: {
		view: CheckFinderView;
	} = $props();

	let checks: CheckScanResult[] = $state([]);
	let locked: boolean = $state(false);
	let file: TFile | null = $state(null);

	async function withLocked<T>(fn: () => Promise<T>): Promise<T> {
		locked = true;
		try {
			return await fn();
		} finally {
			locked = false;
		}
	}

	async function transformCheck(check: CheckScanResult) {
		await withLocked(async () => {
			if (!file) {
				new Notice('No file selected');
				return;
			}

			if (await view.checkFinder.convertCheck(check, file)) {
				checks = checks.filter(m => m !== check);
				await findChecks();
			} else {
				new Notice('Failed to transform check');
			}
		});
	}

	async function findChecks() {
		if (!file) {
			return;
		}
		const content = await view.plugin.app.vault.cachedRead(file);
		checks = await view.checkFinder.findChecks(content);
	}

	function selectFile() {
		new FilePrompt(view.plugin.app, async f => {
			await withLocked(async () => {
				file = f;
				checks = [];
				await findChecks();
			});
		}).open();
	}
</script>

<span>{file ? file.path : 'None'}</span>

<button onclick={() => selectFile()} disabled={locked}>Select File</button>

<button onclick={() => findChecks()} disabled={locked || !file}>Find Checks</button>

{#if checks.length > 0}
	<p>Found {checks.length} checks</p>

	<table style="width: 100%">
		<thead>
			<tr>
				<th>Check</th>
				<th>Transform</th>
			</tr>
		</thead>
		<tbody>
			{#each checks.slice(0, 100) as result}
				<tr>
					<td><CheckHighlight check={result}></CheckHighlight></td>
					<td>
						<button onclick={() => void transformCheck(result)} disabled={locked}>{formatInlineCheck(result.check)}</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else if locked}
	<p>Searching...</p>
{:else}
	<p>No mentions found</p>
{/if}

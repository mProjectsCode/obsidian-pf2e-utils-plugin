import type { TFile, WorkspaceLeaf } from 'obsidian';
import { Notice, Plugin } from 'obsidian';
import { Pf2eCheckMDRC } from 'packages/obsidian/src/InlineCheckMDRC';
import { NaturalLanguageCheckFinder } from 'packages/obsidian/src/NaturalLanguageCheckFinder';
import { GameSystem, stringifyPf2eCheck } from 'packages/obsidian/src/rolls/Pf2eCheck';
import type { Pf2eUtilsSettings } from 'packages/obsidian/src/settings/Settings';
import { DEFAULT_SETTINGS } from 'packages/obsidian/src/settings/Settings';
import { SampleSettingTab } from 'packages/obsidian/src/settings/SettingTab';
import { CheckFinderView } from 'packages/obsidian/src/ui/checkFinder/CheckFinderView';
import { openCheckBuilderModal } from 'packages/obsidian/src/ui/modals/CheckBuilderModal';

const VIEW_TYPE_CHECK_FINDER_PF2E = 'pf2e-utils-check-finder-pf2e';
const VIEW_TYPE_CHECK_FINDER_PF1E = 'pf2e-utils-check-finder-pf1e';

export default class Pf2eUtilsPlugin extends Plugin {
	settings!: Pf2eUtilsSettings;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.registerMarkdownPostProcessor((el, ctx) => {
			const codeBlocks = el.querySelectorAll('code');

			const levelProp = (ctx.frontmatter as Record<string, unknown> | undefined)?.level;
			let level: number | undefined;
			if (typeof levelProp === 'number') {
				level = levelProp;
			}
			if (typeof levelProp === 'string') {
				const parsed = parseInt(levelProp, 10);
				if (!isNaN(parsed)) {
					level = parsed;
				}
			}

			for (let index = 0; index < codeBlocks.length; index++) {
				const codeBlock = codeBlocks.item(index);

				if (codeBlock.hasClass('pf2e-none')) {
					continue;
				}

				const content = codeBlock.innerText.trim();
				if (content.startsWith('@Check[') && content.endsWith(']')) {
					ctx.addChild(new Pf2eCheckMDRC(codeBlock, content, level));
				}
			}
		});

		this.registerView(VIEW_TYPE_CHECK_FINDER_PF1E, leaf => {
			const checkFinder = new NaturalLanguageCheckFinder(this, GameSystem.PF1E);
			return new CheckFinderView(VIEW_TYPE_CHECK_FINDER_PF1E, leaf, this, checkFinder, GameSystem.PF1E);
		});

		this.registerView(VIEW_TYPE_CHECK_FINDER_PF2E, leaf => {
			const checkFinder = new NaturalLanguageCheckFinder(this, GameSystem.PF2E);
			return new CheckFinderView(VIEW_TYPE_CHECK_FINDER_PF2E, leaf, this, checkFinder, GameSystem.PF2E);
		});

		this.addCommand({
			id: 'open-pf1e-check-finder',
			name: 'Open PF1E Check Finder',
			callback: async () => {
				await this.activateView(VIEW_TYPE_CHECK_FINDER_PF1E);
			},
		});

		this.addCommand({
			id: 'open-pf2e-check-finder',
			name: 'Open PF2E Check Finder',
			callback: async () => {
				await this.activateView(VIEW_TYPE_CHECK_FINDER_PF2E);
			},
		});

		this.addCommand({
			id: 'open-pf2e-check-builder',
			name: 'Open PF2E Check Builder',
			callback: async () => {
				const activeFile = this.app.workspace.getActiveFile();
				const level = activeFile ? this.getLevelFromFrontmatter(activeFile) : undefined;

				const check = await openCheckBuilderModal(this, level, 'Copy to Clipboard');

				if (check) {
					await navigator.clipboard.writeText('`' + stringifyPf2eCheck(check) + '`');
					new Notice('Check copied to clipboard');
				}
			},
		});
	}

	onunload(): void {}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()) as Pf2eUtilsSettings;
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	async activateView(viewType: string): Promise<void> {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null;
		const leaves = workspace.getLeavesOfType(viewType);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getLeaf('tab');
			await leaf.setViewState({ type: viewType, active: true });
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		await workspace.revealLeaf(leaf);
	}

	/**
	 * Replaces a string at a specific index in a file.
	 * This checks that the string at the index matches the expected string before replacing it.
	 * If the string matches and the replacement is successful, it returns true.
	 * If the replacement was unsuccessful (e.g., the string at the index has changed), it returns false.
	 *
	 * @param file the file to replace in
	 * @param index the start index of the expected string
	 * @param expected the expected string at the position
	 * @param replacement the replacement string for the expected string
	 * @returns
	 */
	async safeReplaceAtIndex(file: TFile, index: number, expected: string, replacement: string): Promise<boolean> {
		try {
			let modified = false;
			await this.app.vault.process(file, text => {
				const pre = text.slice(0, index);
				const post = text.slice(index + expected.length);
				const oldText = text.slice(index, index + expected.length);

				if (oldText !== expected) {
					new Notice('Failed to replace text. The text has changed since it was found.');
					return text;
				}

				modified = true;
				return pre + replacement + post;
			});

			return modified;
		} catch (e) {
			new Notice('Failed to replace text. See the console for more info.');
			console.warn(e);
			return false;
		}
	}

	getLevelFromFrontmatter(file: TFile): number | undefined {
		const levelProp = (this.app.metadataCache.getFileCache(file)?.frontmatter as Record<string, unknown> | undefined)?.level;
		return this.parseLevel(levelProp);
	}

	parseLevel(levelProp: unknown): number | undefined {
		if (typeof levelProp === 'number') {
			return levelProp;
		}
		if (typeof levelProp === 'string') {
			const parsed = parseInt(levelProp, 10);
			if (!isNaN(parsed)) {
				return parsed;
			}
		}
		return undefined;
	}
}

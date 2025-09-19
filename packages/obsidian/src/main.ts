import { Plugin } from 'obsidian';
import { InlineCheckMDRC } from 'packages/obsidian/src/InlineCheckMDRC';
import type { MyPluginSettings } from 'packages/obsidian/src/settings/Settings';
import { DEFAULT_SETTINGS } from 'packages/obsidian/src/settings/Settings';
import { SampleSettingTab } from 'packages/obsidian/src/settings/SettingTab';

export default class MyPlugin extends Plugin {
	settings!: MyPluginSettings;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.registerMarkdownPostProcessor((el, ctx) => {
			const codeBlocks = el.querySelectorAll('code');

			for (let index = 0; index < codeBlocks.length; index++) {
				const codeBlock = codeBlocks.item(index);

				if (codeBlock.hasClass('pf2e-none')) {
					continue;
				}

				const content = codeBlock.innerText.trim();
				if (content.startsWith('@Check[') && content.endsWith(']')) {
					ctx.addChild(new InlineCheckMDRC(codeBlock, content));
				}
			}
		});
	}

	onunload(): void {}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()) as MyPluginSettings;
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}

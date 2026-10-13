import type { App, SettingDefinitionItem } from 'obsidian';
import { PluginSettingTab } from 'obsidian';
import type Pf2eUtilsPlugin from 'packages/obsidian/src/main';

export class Pf2eUtilsSettingTab extends PluginSettingTab {
	plugin: Pf2eUtilsPlugin;

	constructor(app: App, plugin: Pf2eUtilsPlugin) {
		super(app, plugin);

		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: 'Skill conversion ignore lore',
				desc: "When converting PF1E checks to PF2E, don't include lore.",
				control: { type: 'toggle', key: 'skillConversionIgnoreLore' },
			},
		];
	}
}

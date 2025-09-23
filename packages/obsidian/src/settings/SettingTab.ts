import type { App } from 'obsidian';
import { PluginSettingTab, Setting } from 'obsidian';
import type Pf2eUtilsPlugin from 'packages/obsidian/src/main';

export class SampleSettingTab extends PluginSettingTab {
	plugin: Pf2eUtilsPlugin;

	constructor(app: App, plugin: Pf2eUtilsPlugin) {
		super(app, plugin);

		this.plugin = plugin;
	}

	display(): void {
		this.containerEl.empty();

		new Setting(this.containerEl)
			.setName('Skill conversion ignore lore')
			.setDesc("When converting PF1E checks to PF2E, don't include lore.")
			.addToggle(toggle =>
				toggle.setValue(this.plugin.settings.skillConversionIgnoreLore).onChange(async value => {
					this.plugin.settings.skillConversionIgnoreLore = value;
					await this.plugin.saveSettings();
				}),
			);
	}
}

import { Modal } from 'obsidian';
import type Pf2eUtilsPlugin from 'packages/obsidian/src/main';
import { convertPf1eCheckToPf2eCheck } from 'packages/obsidian/src/rolls/CheckConversion';
import type {Pf1eCheck} from 'packages/obsidian/src/rolls/Pf1eCheck';
import { formatPf1eCheck  } from 'packages/obsidian/src/rolls/Pf1eCheck';
import type { Pf2eCheck } from 'packages/obsidian/src/rolls/Pf2eCheck';
import Pf2eInlineCheckBuilder from 'packages/obsidian/src/ui/Pf2eInlineCheckBuilder.svelte';
import { mount, unmount } from 'svelte';

export async function openCheckConversionModal(plugin: Pf2eUtilsPlugin, check: Pf1eCheck, level: number): Promise<Pf2eCheck | undefined> {
	return new Promise(resolve => {
		const modal = new CheckConversionModal(
			plugin,
			check,
			level,
			convertedCheck => {
				resolve(convertedCheck);
			},
			() => {
				resolve(undefined);
			},
		);
		modal.open();
	});
}

export class CheckConversionModal extends Modal {
	private readonly plugin: Pf2eUtilsPlugin;
	private readonly check: Pf1eCheck;
	private readonly level: number;
	private readonly onSubmit: (check: Pf2eCheck) => void;
	private readonly onCancel: () => void;
	private svelteComponent: ReturnType<typeof Pf2eInlineCheckBuilder> | undefined;
	private returned: boolean = false;

	constructor(plugin: Pf2eUtilsPlugin, check: Pf1eCheck, level: number, onSubmit: (check: Pf2eCheck) => void, onCancel: () => void) {
		super(plugin.app);
		this.plugin = plugin;
		this.check = check;
		this.level = level;
		this.onSubmit = onSubmit;
		this.onCancel = onCancel;
	}

	onOpen(): void {
		this.setTitle('Convert Check');
		this.contentEl.empty();

		this.contentEl.createEl('p', { text: `Pf1e check: ${formatPf1eCheck(this.check)}` });

		const builderEl = this.contentEl.createDiv();

		const pf2eCheck = convertPf1eCheckToPf2eCheck(this.check, this.level, this.plugin.settings.skillConversionIgnoreLore);

		this.svelteComponent = mount(Pf2eInlineCheckBuilder, {
			target: builderEl,
			props: {
				onCancel: () => {
					this.onCancel();
					this.returned = true;
					this.close();
				},
				onSubmit: (check: Pf2eCheck) => {
					this.onSubmit(check);
					this.returned = true;
					this.close();
				},
				prefillCheck: pf2eCheck,
				level: this.level,
			},
		});
	}

	onClose(): void {
		if (!this.returned) {
			this.onCancel();
		}
		if (this.svelteComponent) {
			void unmount(this.svelteComponent);
		}
		this.contentEl.empty();
	}
}

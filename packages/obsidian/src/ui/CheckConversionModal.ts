import { Modal } from 'obsidian';
import type Pf2eUtilsPlugin from 'packages/obsidian/src/main';
import type { InlineCheck } from 'packages/obsidian/src/rolls/InlineCheck';
import { formatInlineCheck, GameSystem } from 'packages/obsidian/src/rolls/InlineCheck';
import { convertPf1eCheckToPf2eCheck } from 'packages/obsidian/src/rolls/InlineCheckConversion';
import Pf2eInlineCheckBuilder from 'packages/obsidian/src/ui/Pf2eInlineCheckBuilder.svelte';
import { mount, unmount } from 'svelte';

export async function openCheckConversionModal(plugin: Pf2eUtilsPlugin, check: InlineCheck, level: number): Promise<InlineCheck | undefined> {
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
	private readonly check: InlineCheck;
	private readonly level: number;
	private readonly onSubmit: (check: InlineCheck) => void;
	private readonly onCancel: () => void;
	private svelteComponent: ReturnType<typeof Pf2eInlineCheckBuilder> | undefined;
	private returned: boolean = false;

	constructor(plugin: Pf2eUtilsPlugin, check: InlineCheck, level: number, onSubmit: (check: InlineCheck) => void, onCancel: () => void) {
		super(plugin.app);
		this.plugin = plugin;
		this.check = check;
		this.level = level;
		this.onSubmit = onSubmit;
		this.onCancel = onCancel;

		if (this.check.system !== GameSystem.PF1E) {
			throw new Error('CheckConversionModal can only be used for pf1e checks');
		}
	}

	onOpen(): void {
		this.setTitle('Convert Check');
		this.contentEl.empty();

		this.contentEl.createEl('p', { text: `Pf1e check: ${formatInlineCheck(this.check)}` });

		const builderEl = this.contentEl.createDiv();

		const pf2eCheck = convertPf1eCheckToPf2eCheck(this.check, this.level);

		this.svelteComponent = mount(Pf2eInlineCheckBuilder, {
			target: builderEl,
			props: {
				onCancel: () => {
					this.onCancel();
					this.returned = true;
					this.close();
				},
				onSubmit: (check: InlineCheck) => {
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

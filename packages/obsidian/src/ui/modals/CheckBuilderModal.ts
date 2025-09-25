import { Modal } from 'obsidian';
import type Pf2eUtilsPlugin from 'packages/obsidian/src/main';
import type { Pf2eCheck } from 'packages/obsidian/src/rolls/Pf2eCheck';
import Pf2eInlineCheckBuilder from 'packages/obsidian/src/ui/Pf2eInlineCheckBuilder.svelte';
import { mount, unmount } from 'svelte';

export async function openCheckBuilderModal(plugin: Pf2eUtilsPlugin, level: number | undefined, submitLabel: string): Promise<Pf2eCheck | undefined> {
	return new Promise(resolve => {
		const modal = new CheckBuilderModal(
			plugin,
			level,
			submitLabel,
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

export class CheckBuilderModal extends Modal {
	private readonly plugin: Pf2eUtilsPlugin;
	private readonly level: number | undefined;
	private readonly submitLabel: string;
	private readonly onSubmit: (check: Pf2eCheck) => void;
	private readonly onCancel: () => void;
	private svelteComponent: ReturnType<typeof Pf2eInlineCheckBuilder> | undefined;
	private returned: boolean = false;

	constructor(plugin: Pf2eUtilsPlugin, level: number | undefined, submitLabel: string, onSubmit: (check: Pf2eCheck) => void, onCancel: () => void) {
		super(plugin.app);
		this.plugin = plugin;
		this.level = level;
		this.submitLabel = submitLabel;
		this.onSubmit = onSubmit;
		this.onCancel = onCancel;
	}

	onOpen(): void {
		this.setTitle('Convert Check');
		this.contentEl.empty();

		this.svelteComponent = mount(Pf2eInlineCheckBuilder, {
			target: this.contentEl,
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
				prefillCheck: undefined,
				level: this.level,
				submitLabel: this.submitLabel,
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

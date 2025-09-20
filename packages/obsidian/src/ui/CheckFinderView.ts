import type { WorkspaceLeaf } from 'obsidian';
import { ItemView } from 'obsidian';
import type { ICheckFinder } from 'packages/obsidian/src/ICheckFinder';
import type Pf2eUtilsPlugin from 'packages/obsidian/src/main';
import CheckFinderComponent from 'packages/obsidian/src/ui/CheckFinderComponent.svelte';
import type { Component as SvelteComponent } from 'svelte';
import { mount, unmount } from 'svelte';

export class CheckFinderView extends ItemView {
	component: ReturnType<SvelteComponent> | undefined;
	plugin: Pf2eUtilsPlugin;
	checkFinder: ICheckFinder;
	viewType: string;

	constructor(viewType: string, leaf: WorkspaceLeaf, plugin: Pf2eUtilsPlugin, checkFinder: ICheckFinder) {
		super(leaf);

		this.viewType = viewType;
		this.plugin = plugin;
		this.checkFinder = checkFinder;
	}

	getViewType(): string {
		return this.viewType;
	}

	getDisplayText(): string {
		return 'Check Finder';
	}

	protected async onOpen(): Promise<void> {
		this.contentEl.empty();
		this.contentEl.classList.add('markdown-rendered');

		this.component = mount(CheckFinderComponent, {
			target: this.contentEl,
			props: {
				view: this,
			},
		});
	}

	protected async onClose(): Promise<void> {
		if (this.component) {
			void unmount(this.component);
		}
	}
}

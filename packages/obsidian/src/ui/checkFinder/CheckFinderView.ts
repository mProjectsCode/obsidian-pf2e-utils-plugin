import type { WorkspaceLeaf } from 'obsidian';
import { ItemView } from 'obsidian';
import type { ICheckFinder } from 'packages/obsidian/src/ICheckFinder';
import type Pf2eUtilsPlugin from 'packages/obsidian/src/main';
import type { GameSystem } from 'packages/obsidian/src/rolls/Pf2eCheck';
import CheckFinderComponent from 'packages/obsidian/src/ui/checkFinder/CheckFinderComponent.svelte';
import type { Component as SvelteComponent } from 'svelte';
import { mount, unmount } from 'svelte';

export class CheckFinderView<System extends GameSystem> extends ItemView {
	component: ReturnType<SvelteComponent> | undefined;
	plugin: Pf2eUtilsPlugin;
	checkFinder: ICheckFinder<System>;
	viewType: string;
	gameSystem: System;

	constructor(viewType: string, leaf: WorkspaceLeaf, plugin: Pf2eUtilsPlugin, checkFinder: ICheckFinder<System>, gameSystem: System) {
		super(leaf);

		this.viewType = viewType;
		this.plugin = plugin;
		this.checkFinder = checkFinder;
		this.gameSystem = gameSystem;
	}

	getViewType(): string {
		return this.viewType;
	}

	getDisplayText(): string {
		return `${this.gameSystem} Check Finder`;
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

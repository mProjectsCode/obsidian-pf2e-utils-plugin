import type { App, TFile } from 'obsidian';
import { FuzzySuggestModal } from 'obsidian';

export class FilePrompt extends FuzzySuggestModal<TFile> {
	onChoose: (item: TFile) => void;

	constructor(app: App, onChoose: (item: TFile) => void) {
		super(app);
		this.onChoose = onChoose;
		this.setPlaceholder('Select a file...');
	}

	getItems(): TFile[] {
		return this.app.vault.getFiles();
	}

	getItemText(item: TFile): string {
		return item.path;
	}

	onChooseItem(item: TFile, _: MouseEvent | KeyboardEvent): void {
		this.onChoose(item);
	}
}

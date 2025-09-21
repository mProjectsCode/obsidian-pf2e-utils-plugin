import type { TFile } from 'obsidian';
import { Modal, Notice } from 'obsidian';
import type Pf2eUtilsPlugin from 'packages/obsidian/src/main';

export async function openLevelUpdateModal(plugin: Pf2eUtilsPlugin, file: TFile): Promise<number | undefined> {
	return new Promise(resolve => {
		const modal = new LevelUpdateModal(
			plugin,
			file,
			level => {
				resolve(level);
			},
			level => {
				resolve(level);
			},
		);
		modal.open();
	});
}

export class LevelUpdateModal extends Modal {
	private readonly plugin: Pf2eUtilsPlugin;
	private readonly file: TFile;
	private readonly onSubmit: (level: number) => void;
	private readonly onCancel: (level: number | undefined) => void;
	private returned: boolean = false;

	constructor(plugin: Pf2eUtilsPlugin, file: TFile, onSubmit: (level: number) => void, onCancel: (level: number | undefined) => void) {
		super(plugin.app);
		this.plugin = plugin;
		this.file = file;
		this.onSubmit = onSubmit;
		this.onCancel = onCancel;
	}

	onOpen(): void {
		this.setTitle('Update Level');

		this.contentEl.empty();

		this.contentEl.createEl('p', { text: "This will update the 'level' property in the frontmatter of the current file." });

		const currentLevel = this.plugin.getLevelFromFrontmatter(this.file);
		if (currentLevel != null) {
			this.contentEl.createEl('p', { text: `Current level: ${currentLevel}` });
		} else {
			this.contentEl.createEl('p', { text: 'No current level found in frontmatter.' });
		}

		const inputEl = this.contentEl.createEl('input', {
			type: 'number',
			cls: 'pf2e-wide-input',
			attr: { min: '1', max: '20', value: currentLevel?.toString() ?? '', placeholder: 'Level' },
		});
		inputEl.focus();
		inputEl.select();

		const buttonContainer = this.contentEl.createDiv({ cls: 'pf2e-button-row' });
		const submitButton = buttonContainer.createEl('button', { text: 'Save', cls: 'mod-cta' });
		const cancelButton = buttonContainer.createEl('button', { text: 'Cancel' });

		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		submitButton.addEventListener('click', async () => {
			const value = parseInt(inputEl.value, 10);
			if (!isNaN(value) && value >= 1 && value <= 20) {
				await this.plugin.app.fileManager.processFrontMatter(this.file, frontmatter => {
					(frontmatter as Record<string, unknown>).level = value;
				});

				this.onSubmit(value);
				this.returned = true;
				this.close();
			} else {
				new Notice('Please enter a valid level between 1 and 20.');
			}
		});

		cancelButton.addEventListener('click', () => {
			this.onCancel(this.plugin.getLevelFromFrontmatter(this.file));
			this.returned = true;
			this.close();
		});

		inputEl.addEventListener('keydown', event => {
			if (event.key === 'Enter') {
				submitButton.click();
			} else if (event.key === 'Escape') {
				cancelButton.click();
			}
		});
	}

	onClose(): void {
		this.contentEl.empty();
		if (!this.returned) {
			this.onCancel(this.plugin.getLevelFromFrontmatter(this.file));
		}
	}
}

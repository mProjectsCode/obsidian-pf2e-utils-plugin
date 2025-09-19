import { MarkdownRenderChild, Notice } from 'obsidian';
import type { InlineCheck } from 'packages/obsidian/src/rolls/InlineCheck';
import { formatInlineCheck, INLINE_CHECK_PARSER } from 'packages/obsidian/src/rolls/InlineCheck';

export class InlineCheckMDRC extends MarkdownRenderChild {
	private content: string;
	private check: InlineCheck | undefined;

	constructor(containerEl: HTMLElement, content: string) {
		super(containerEl);
		this.content = content;
		this.check = INLINE_CHECK_PARSER.tryParse(this.content).value;
	}

	onload(): void {
		this.containerEl.empty();
		if (this.check) {
			const formatted = formatInlineCheck(this.check);
			const span = this.containerEl.createEl('span', { text: formatted });
			span.addEventListener('click', () => {
				void navigator.clipboard.writeText(this.content);
				new Notice('Copied raw inline check to clipboard');
			});
		} else {
			this.containerEl.createEl('span', { text: 'Invalid Inline Check', cls: 'error' });
		}
	}

	onunload(): void {
		this.containerEl.empty();
		this.containerEl.innerText = 'unloaded inline check';
	}
}

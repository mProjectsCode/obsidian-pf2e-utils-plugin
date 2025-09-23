import { MarkdownRenderChild, Notice } from 'obsidian';
import type { InlineCheck } from 'packages/obsidian/src/rolls/InlineCheck';
import { formatInlineCheck, INLINE_CHECK_PARSER } from 'packages/obsidian/src/rolls/InlineCheck';
import { getPf2eCheckClassification } from 'packages/obsidian/src/rolls/InlineCheckConversion';
import { cleanEscapes } from 'packages/obsidian/src/utils/misc';

export class InlineCheckMDRC extends MarkdownRenderChild {
	private content: string;
	private cleanedContent: string;
	private check: InlineCheck | undefined;
	private level: number | undefined;

	constructor(containerEl: HTMLElement, content: string, level: number | undefined) {
		super(containerEl);
		this.content = content;
		this.cleanedContent = cleanEscapes(content);
		this.check = INLINE_CHECK_PARSER.tryParse(this.cleanedContent).value;
		this.level = level;
	}

	onload(): void {
		this.containerEl.empty();
		if (this.check) {
			const formatted = formatInlineCheck(this.check);
			const span = this.containerEl.createEl('span', { text: formatted });
			span.addEventListener('click', () => {
				void navigator.clipboard.writeText(this.cleanedContent);
				new Notice('Copied raw inline check to clipboard');
			});
			span.setAttribute('aria-label', this.getTooltip());
			span.setAttribute('data-tooltip-delay', '100');
			console.log(this);
		} else {
			this.containerEl.createEl('span', { text: 'Invalid Inline Check', cls: 'error' });
		}
	}

	onunload(): void {
		this.containerEl.empty();
		this.containerEl.innerText = 'unloaded inline check';
	}

	getTooltip(): string {
		if (!this.check) {
			return 'Invalid Inline Check';
		}

		return `${this.content}\n${getPf2eCheckClassification(this.check, this.level)}`;
	}
}

import { MarkdownRenderChild, Notice } from 'obsidian';
import { getPf2eCheckClassification } from 'packages/obsidian/src/rolls/CheckConversion';
import type { Pf2eCheck } from 'packages/obsidian/src/rolls/Pf2eCheck';
import { formatPf2eCheck, INLINE_CHECK_PARSER } from 'packages/obsidian/src/rolls/Pf2eCheck';
import { cleanEscapes } from 'packages/obsidian/src/utils/misc';

export class InlineCheckMDRC extends MarkdownRenderChild {
	private content: string;
	private cleanedContent: string;
	private check: Pf2eCheck | undefined;
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
			const formatted = formatPf2eCheck(this.check);
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

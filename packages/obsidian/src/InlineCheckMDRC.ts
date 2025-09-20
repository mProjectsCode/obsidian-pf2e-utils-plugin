import { MarkdownRenderChild, Notice } from 'obsidian';
import type { InlineCheck } from 'packages/obsidian/src/rolls/InlineCheck';
import { formatInlineCheck, INLINE_CHECK_PARSER } from 'packages/obsidian/src/rolls/InlineCheck';
import { pf2eCheckDifficulty, pf2eCheckRequiredProficiency, pf2eLevelBasedDC } from 'packages/obsidian/src/rolls/InlineCheckConversion';

export class InlineCheckMDRC extends MarkdownRenderChild {
	private content: string;
	private check: InlineCheck | undefined;
	private level: number | undefined;

	constructor(containerEl: HTMLElement, content: string, level: number | undefined) {
		super(containerEl);
		this.content = content;
		this.check = INLINE_CHECK_PARSER.tryParse(this.content).value;
		this.level = level;
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

		const difficulty = this.getDifficultyString();
		const requiredProf = this.getRequiredProficiencyString();
		const secondLine = [difficulty, requiredProf].filter(Boolean).join('; ');

		return `${this.content}\n${secondLine}`;
	}

	getDifficultyString(): string {
		if (!this.check || this.level === undefined || this.check.dc === undefined) {
			return '';
		}

		const difficulty = pf2eCheckDifficulty(this.level, this.check.dc);
		const levelBasedDC = pf2eLevelBasedDC(this.level);
		const diff = this.check.dc - levelBasedDC;
		const diffSign = diff >= 0 ? '+' : '';
		const diffStr = `${diffSign}${diff}`;
		return `${difficulty} (${diffStr})`;
	}

	getRequiredProficiencyString(): string {
		if (this.check?.dc === undefined) {
			return '';
		}

		return pf2eCheckRequiredProficiency(this.check.dc);
	}
}

import type { TFile } from 'obsidian';
import type { ICheckFinder } from 'packages/obsidian/src/ICheckFinder';
import type Pf2eUtilsPlugin from 'packages/obsidian/src/main';
import type { InlineCheck } from 'packages/obsidian/src/rolls/InlineCheck';
import { GameSystem } from 'packages/obsidian/src/rolls/InlineCheck';
import { stringifyInlineCheck } from 'packages/obsidian/src/rolls/InlineCheck';
import type { CheckScanResult } from 'packages/obsidian/src/rolls/NaturalLanguageCheckScanner';
import { scanForNaturalLanguageChecks } from 'packages/obsidian/src/rolls/NaturalLanguageCheckScanner';
import { openCheckConversionModal } from 'packages/obsidian/src/ui/CheckConversionModal';

export class NaturalLanguageCheckFinder implements ICheckFinder {
	private readonly plugin: Pf2eUtilsPlugin;
	private readonly system: GameSystem;

	constructor(plugin: Pf2eUtilsPlugin, system: GameSystem) {
		this.plugin = plugin;
		this.system = system;
	}

	findChecks(content: string): Promise<CheckScanResult[]> {
		return Promise.resolve(scanForNaturalLanguageChecks(content, this.system));
	}

	async convertCheck(check: CheckScanResult, file: TFile, level: number): Promise<boolean> {
		let checkObj = check.check;
		if (this.system === GameSystem.PF1E) {
			const convertCheck = await openCheckConversionModal(this.plugin, check.check, level);
			if (convertCheck) {
				checkObj = convertCheck;
			} else {
				return false;
			}
		}

		const replacement = '`' + stringifyInlineCheck(checkObj) + '`';

		return await this.plugin.safeReplaceAtIndex(file, check.startIndex, check.text, replacement);
	}

	formatCheck(check: InlineCheck): string {
		if (this.system === GameSystem.PF2E) {
			return stringifyInlineCheck(check);
		} else {
			return 'Convert to Pf2e';
		}
	}
}

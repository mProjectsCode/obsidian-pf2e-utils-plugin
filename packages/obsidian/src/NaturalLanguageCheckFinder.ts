import type { TFile } from 'obsidian';
import type { ICheckFinder } from 'packages/obsidian/src/ICheckFinder';
import type Pf2eUtilsPlugin from 'packages/obsidian/src/main';
import type { GameSystem } from 'packages/obsidian/src/rolls/InlineCheck';
import { stringifyInlineCheck } from 'packages/obsidian/src/rolls/InlineCheck';
import type { CheckScanResult } from 'packages/obsidian/src/rolls/NaturalLanguageCheckScanner';
import { scanForNaturalLanguageChecks } from 'packages/obsidian/src/rolls/NaturalLanguageCheckScanner';

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

	convertCheck(check: CheckScanResult, file: TFile): Promise<boolean> {
		const checkObj = check.check;
		// todo: proper conversion, this probably needs a full nice UI
		// if (this.system === GameSystem.PF1E) {
		//     checkObj = convertPf1eToPf2eDC(checkObj);
		// }

		const replacement = '`' + stringifyInlineCheck(checkObj) + '`';

		return this.plugin.safeReplaceAtIndex(file, check.startIndex, check.text, replacement);
	}
}

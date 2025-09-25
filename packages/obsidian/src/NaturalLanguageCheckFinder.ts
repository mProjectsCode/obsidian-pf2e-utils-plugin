import type { TFile } from 'obsidian';
import type { ICheckFinder } from 'packages/obsidian/src/ICheckFinder';
import type Pf2eUtilsPlugin from 'packages/obsidian/src/main';
import type { CheckScanResult, SystemToCheckMap } from 'packages/obsidian/src/rolls/NaturalLanguageCheckScanner';
import { scanForNaturalLanguageChecks } from 'packages/obsidian/src/rolls/NaturalLanguageCheckScanner';
import type { Pf1eCheck } from 'packages/obsidian/src/rolls/Pf1eCheck';
import type { Pf2eCheck } from 'packages/obsidian/src/rolls/Pf2eCheck';
import { GameSystem } from 'packages/obsidian/src/rolls/Pf2eCheck';
import { stringifyInlineCheck as stringifyPf2eCheck } from 'packages/obsidian/src/rolls/Pf2eCheck';
import { openCheckConversionModal } from 'packages/obsidian/src/ui/CheckConversionModal';

export class NaturalLanguageCheckFinder<System extends GameSystem> implements ICheckFinder<System> {
	private readonly plugin: Pf2eUtilsPlugin;
	private readonly system: System;

	constructor(plugin: Pf2eUtilsPlugin, system: System) {
		this.plugin = plugin;
		this.system = system;
	}

	findChecks(content: string): Promise<CheckScanResult<System>[]> {
		return Promise.resolve(scanForNaturalLanguageChecks(content, this.system));
	}

	async convertCheck(check: CheckScanResult<System>, file: TFile, level: number): Promise<boolean> {
		let checkObj: Pf2eCheck;
		if (this.system === GameSystem.PF1E) {
			const convertCheck = await openCheckConversionModal(this.plugin, check.check as Pf1eCheck, level);
			if (convertCheck) {
				checkObj = convertCheck;
			} else {
				return false;
			}
		} else {
			checkObj = check.check as Pf2eCheck;
		}

		const replacement = '`' + stringifyPf2eCheck(checkObj) + '`';

		return await this.plugin.safeReplaceAtIndex(file, check.startIndex, check.text, replacement);
	}

	formatCheck(check: SystemToCheckMap[System]): string {
		if (this.system === GameSystem.PF2E) {
			return stringifyPf2eCheck(check as Pf2eCheck);
		} else {
			return 'Convert to Pf2e';
		}
	}
}

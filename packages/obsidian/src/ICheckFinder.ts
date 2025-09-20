import type { TFile } from 'obsidian';
import type { CheckScanResult } from 'packages/obsidian/src/rolls/NaturalLanguageCheckScanner';

export interface ICheckFinder {
	findChecks(content: string): Promise<CheckScanResult[]>;
	convertCheck(check: CheckScanResult, file: TFile): Promise<boolean>;
}

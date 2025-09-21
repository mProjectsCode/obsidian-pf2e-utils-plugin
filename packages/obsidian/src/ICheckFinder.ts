import type { TFile } from 'obsidian';
import type { InlineCheck } from 'packages/obsidian/src/rolls/InlineCheck';
import type { CheckScanResult } from 'packages/obsidian/src/rolls/NaturalLanguageCheckScanner';

export interface ICheckFinder {
	findChecks(content: string): Promise<CheckScanResult[]>;
	convertCheck(check: CheckScanResult, file: TFile, level: number): Promise<boolean>;
	formatCheck(check: InlineCheck): string;
}

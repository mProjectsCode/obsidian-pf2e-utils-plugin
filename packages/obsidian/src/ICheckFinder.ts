import type { TFile } from 'obsidian';
import type { CheckScanResult, SystemToCheckMap } from 'packages/obsidian/src/rolls/NaturalLanguageCheckScanner';
import type { GameSystem } from 'packages/obsidian/src/rolls/Pf2eCheck';

export interface ICheckFinder<System extends GameSystem> {
	findChecks(content: string): Promise<CheckScanResult<GameSystem>[]>;
	convertCheck(check: CheckScanResult<System>, file: TFile, level: number): Promise<boolean>;
	formatCheck(check: SystemToCheckMap[System]): string;
}

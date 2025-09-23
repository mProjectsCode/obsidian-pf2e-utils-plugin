import { describe, expect, test } from 'bun:test';
import { cleanEscapes } from 'packages/obsidian/src/utils/misc';

describe('cleanEscapes', () => {
	test('replaces \\n with newline', () => {
		expect(cleanEscapes('Hello\\nWorld')).toBe('Hello\nWorld');
	});

	test('replaces \\t with tab', () => {
		expect(cleanEscapes('Hello\\tWorld')).toBe('Hello\tWorld');
	});

	test('replaces \\\\ with \\', () => {
		expect(cleanEscapes('Hello\\\\World')).toBe('Hello\\World');
	});

	test('replaces \\| with |', () => {
		expect(cleanEscapes('Hello\\|World')).toBe('Hello|World');
	});

	test('replaces \\[ with [', () => {
		expect(cleanEscapes('Hello\\[World')).toBe('Hello[World');
	});

	test('handles multiple escapes', () => {
		expect(cleanEscapes('Line1\\nLine2\\tTabbed\\\\Backslash\\|Pipe')).toBe('Line1\nLine2\tTabbed\\Backslash|Pipe');
	});

	test('handles no escapes', () => {
		expect(cleanEscapes('Hello World')).toBe('Hello World');
	});

	test('handles empty string', () => {
		expect(cleanEscapes('')).toBe('');
	});
});

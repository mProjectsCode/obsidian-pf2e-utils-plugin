import { describe, test, expect, beforeEach } from 'bun:test';
import { Trie } from 'packages/obsidian/src/utils/Trie';

describe('Trie', () => {
	let trie: Trie<number>;

	beforeEach(() => {
		trie = new Trie<number>();
	});

	test('has', () => {
		trie.insert('hello', 1);
		expect(trie.has('hello')).toBe(true);
		expect(trie.has('hell')).toBe(false);
		expect(trie.has('world')).toBe(false);
	});

	test('longestPrefix 1', () => {
		trie.insert('hello', 1);
		trie.insert('hell', 2);
		trie.insert('heaven', 3);

		const result = trie.findLongestPrefix('test helloworld', 5);
		expect(result?.value).toBe(1);
		expect(result?.length).toBe(5);
		expect(result?.str).toBe('hello');
	});

	test('longestPrefix 2', () => {
		trie.insert('hello', 1);
		trie.insert('hell', 2);
		trie.insert('heaven', 3);

		const result = trie.findLongestPrefix('test hellworld', 5);
		expect(result?.value).toBe(2);
		expect(result?.length).toBe(4);
		expect(result?.str).toBe('hell');
	});

	test('longestPrefix 3', () => {
		trie.insert('hello', 1);
		trie.insert('hell', 2);
		trie.insert('heaven', 3);

		const result = trie.findLongestPrefix('test hellworld', 3);
		expect(result).toBeUndefined();
	});

	test('longestPrefix 3', () => {
		trie.insert('hello', 1);
		trie.insert('hell', 2);
		trie.insert('heaven', 3);

		const result = trie.findLongestPrefix('test heavy', 5);
		expect(result).toBeUndefined();
	});

	test('case sensitivity', () => {
		trie.insert('hello', 2);
		trie.insert('HELLO', 2);

		// has() is case-sensitive - exact key matching
		expect(trie.has('Hello')).toBe(false);
		expect(trie.has('hello')).toBe(true);
		expect(trie.has('HELLO')).toBe(true);

		const result = trie.findLongestPrefix('test HELLO there', 5);
		expect(result?.value).toBe(2);
		expect(result?.str).toBe('HELLO');
	});

	test('empty string handling', () => {
		expect(trie.has('')).toBe(false);
		expect(trie.findLongestPrefix('', 0)).toBeUndefined();
		expect(trie.findLongestPrefix('test', 10)).toBeUndefined(); // out of bounds
	});

	test('duplicate insertion throws error', () => {
		trie.insert('test', 1);
		expect(() => trie.insert('test', 2)).toThrow('Duplicate key: test');
	});

	test('overlapping prefixes', () => {
		trie.insert('test', 1);
		trie.insert('testing', 2);
		trie.insert('tea', 3);

		expect(trie.findLongestPrefix('testing123', 0)?.value).toBe(2);
		expect(trie.findLongestPrefix('test123', 0)?.value).toBe(1);
		expect(trie.findLongestPrefix('tea time', 0)?.value).toBe(3);
	});

	test('no match scenarios', () => {
		trie.insert('hello', 1);
		trie.insert('world', 2);

		expect(trie.findLongestPrefix('goodbye', 0)).toBeUndefined();
		expect(trie.findLongestPrefix('hel', 0)).toBeUndefined(); // partial match only
		expect(trie.has('hel')).toBe(false);
	});
});

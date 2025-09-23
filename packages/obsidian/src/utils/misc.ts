export enum ButtonStyleType {
	/**
	 * Default grey button
	 */
	DEFAULT = 'default',
	/**
	 * Primary button in the accent color
	 */
	PRIMARY = 'primary',
	/**
	 * Red button for destructive actions
	 */
	DESTRUCTIVE = 'destructive',
	/**
	 * Plain button with no background
	 */
	PLAIN = 'plain',
}

const ESCAPES: Record<string, string> = {
	'\\n': '\n',
	'\\t': '\t',
	'\\\\': '\\',
};

/**
 * Replaces escaped characters with their actual characters.
 * For example, converts `\n` to a newline character.
 * Other escaped characters are replaced by their character, e.g. `\|` becomes `|`.
 *
 * @param text
 */
export function cleanEscapes(text: string): string {
	return text.replace(/\\n|\\t|\\\\|\\(.)/g, match => ESCAPES[match] ?? match[1]);
}

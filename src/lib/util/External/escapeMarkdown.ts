/**
 *   Copyright 2015 - 2020 Amish Shah
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       https://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

/**
 * The escape markdown options.
 */
export interface EscapeMarkdownOptions {
	/**
	 * Whether or not to escape codeblocks
	 * @default true
	 */
	codeBlock?: boolean;

	/**
	 * Whether or not to escape inline codes
	 * @default true
	 */
	inlineCode?: boolean;

	/**
	 * Whether or not to escape bold text
	 * @default true
	 */
	bold?: boolean;

	/**
	 * Whether or not to escape italic text
	 * @default true
	 */
	italic?: boolean;

	/**
	 * Whether or not to escape underline text
	 * @default true
	 */
	underline?: boolean;

	/**
	 * Whether or not to escape strikethrough text
	 * @default true
	 */
	strikethrough?: boolean;

	/**
	 * Whether or not to escape spoiler text
	 * @default true
	 */
	spoiler?: boolean;

	/**
	 * Whether or not to escape codeblock content
	 * @default true
	 */
	codeBlockContent?: boolean;

	/**
	 * Whether or not to escape inline code content
	 * @default true
	 */
	inlineCodeContent?: boolean;
}

/**
 * Escapes any Discord-flavour markdown in a string
 * @param text Content to escape
 * @param options What types of markdown to escape. Any undefined options are defaulted to `true`
 */
export function escapeMarkdown(
	text: string,
	{
		codeBlock = true,
		inlineCode = true,
		bold = true,
		italic = true,
		underline = true,
		strikethrough = true,
		spoiler = true,
		codeBlockContent = true,
		inlineCodeContent = true
	}: Partial<EscapeMarkdownOptions> = {}
): string {
	if (!codeBlockContent) {
		return text
			.split('```')
			.map((subString, index, array) => {
				if (index % 2 && index !== array.length - 1) return subString;
				return escapeMarkdown(subString, {
					inlineCode,
					bold,
					italic,
					underline,
					strikethrough,
					spoiler,
					inlineCodeContent
				});
			})
			.join(codeBlock ? '\\`\\`\\`' : '```');
	}
	if (!inlineCodeContent) {
		return text
			.split(/(?<=^|[^`])`(?=[^`]|$)/g)
			.map((subString, index, array) => {
				if (index % 2 && index !== array.length - 1) return subString;
				return escapeMarkdown(subString, {
					codeBlock,
					bold,
					italic,
					underline,
					strikethrough,
					spoiler
				});
			})
			.join(inlineCode ? '\\`' : '`');
	}
	if (inlineCode) text = escapeInlineCode(text);
	if (codeBlock) text = escapeCodeBlock(text);
	if (italic) text = escapeItalic(text);
	if (bold) text = escapeBold(text);
	if (underline) text = escapeUnderline(text);
	if (strikethrough) text = escapeStrikethrough(text);
	if (spoiler) text = escapeSpoiler(text);
	return text;
}

/**
 * Escapes bold markdown in a string
 * @param text Content to escape
 */
export function escapeBold(text: string): string {
	let i = 0;
	return text.replace(/\*\*(\*)?/g, (_, match) => {
		if (match) return ++i % 2 ? `${match}\\*\\*` : `\\*\\*${match}`;
		return '\\*\\*';
	});
}

/**
 * Escapes italic markdown in a string
 * @param text Content to escape
 */
export function escapeItalic(text: string): string {
	let i = 0;
	return (text = text.replace(/(?<=^|[^*])\*([^*]|\*\*|$)/g, (_, match) => {
		if (match === '**' || match === '__') return ++i % 2 ? `\\*${match}` : `${match}\\*`;
		return `\\*${match}`;
	}));
}

/**
 * Escapes underline markdown in a string
 * @param text Content to escape
 */
export function escapeUnderline(text: string): string {
	let i = 0;
	return text.replace(/__(_)?/g, (_, match) => {
		if (match) return ++i % 2 ? `${match}\\_\\_` : `\\_\\_${match}`;
		return '\\_\\_';
	});
}

/**
 * Escapes inline code markdown in a string
 * @param text Content to escape
 */
export function escapeInlineCode(text: string): string {
	return text.replace(/(?<=^|[^`])`(?=[^`]|$)/g, '\\`');
}

/**
 * Escapes spoiler markdown in a string
 * @param text Content to escape
 */
export function escapeSpoiler(text: string): string {
	return text.replace(/\|\|/g, '\\|\\|');
}

/**
 * Escapes strikethrough markdown in a string
 * @param text Content to escape
 */
export function escapeStrikethrough(text: string): string {
	return text.replace(/~~/g, '\\~\\~');
}

/**
 * Escapes code block markdown in a string
 * @param text Content to escape
 */
export function escapeCodeBlock(text: string) {
	return text.replace(/```/g, '\\`\\`\\`');
}

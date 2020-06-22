/**
 *   Copyright 2015 - 2020 Amish Shah
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

/**
 * Escapes any Discord-flavour markdown in a string.
 * @param {string} text Content to escape
 * @param {Object} [options={}] What types of markdown to escape
 * @param {boolean} [options.codeBlock=true] Whether to escape code blocks or not
 * @param {boolean} [options.inlineCode=true] Whether to escape inline code or not
 * @param {boolean} [options.bold=true] Whether to escape bolds or not
 * @param {boolean} [options.italic=true] Whether to escape italics or not
 * @param {boolean} [options.underline=true] Whether to escape underlines or not
 * @param {boolean} [options.strikethrough=true] Whether to escape strikethroughs or not
 * @param {boolean} [options.spoiler=true] Whether to escape spoilers or not
 * @param {boolean} [options.codeBlockContent=true] Whether to escape text inside code blocks or not
 * @param {boolean} [options.inlineCodeContent=true] Whether to escape text inside inline code or not
 * @returns {string}
 */
import { escapeCodeBlock } from '@utils/External/escapeCodeBlock';

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
	} = {}
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
 * Escapes bold markdown in a string.
 * @param {string} text Content to escape
 * @returns {string}
 */
function escapeBold(text: string) {
	let i = 0;
	return text.replace(/\*\*(\*)?/g, (_, match) => {
		if (match) return ++i % 2 ? `${match}\\*\\*` : `\\*\\*${match}`;
		return '\\*\\*';
	});
}

/**
 * Escapes italic markdown in a string.
 * @param {string} text Content to escape
 * @returns {string}
 */
function escapeItalic(text: string) {
	let i = 0;
	text = text.replace(/(?<=^|[^*])\*([^*]|\*\*|$)/g, (_, match) => {
		if (match === '**') return ++i % 2 ? `\\*${match}` : `${match}\\*`;
		return `\\*${match}`;
	});
	i = 0;
	return text.replace(/(?<=^|[^_])_([^_]|__|$)/g, (_, match) => {
		if (match === '__') return ++i % 2 ? `\\_${match}` : `${match}\\_`;
		return `\\_${match}`;
	});
}

/**
 * Escapes underline markdown in a string.
 * @param {string} text Content to escape
 * @returns {string}
 */
function escapeUnderline(text: string) {
	let i = 0;
	return text.replace(/__(_)?/g, (_, match) => {
		if (match) return ++i % 2 ? `${match}\\_\\_` : `\\_\\_${match}`;
		return '\\_\\_';
	});
}

/**
 * Escapes inline code markdown in a string.
 * @param {string} text Content to escape
 * @returns {string}
 */

function escapeInlineCode(text: string) {
	return text.replace(/(?<=^|[^`])`(?=[^`]|$)/g, '\\`');
}

/**
 * Escapes spoiler markdown in a string.
 * @param {string} text Content to escape
 * @returns {string}
 */
function escapeSpoiler(text: string) {
	return text.replace(/\|\|/g, '\\|\\|');
}

/**
 * Escapes strikethrough markdown in a string.
 * @param {string} text Content to escape
 * @returns {string}
 */
function escapeStrikethrough(text: string) {
	return text.replace(/~~/g, '\\~\\~');
}

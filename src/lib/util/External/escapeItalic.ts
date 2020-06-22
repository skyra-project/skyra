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
   * Escapes italic markdown in a string.
   * @param {string} text Content to escape
   * @returns {string}
*/

export function escapeItalic(text: string) {
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

export default escapeItalic;

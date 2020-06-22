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
   * Escapes underline markdown in a string.
   * @param {string} text Content to escape
   * @returns {string}
*/

export function escapeUnderline(text: string) {
	let i = 0;
	return text.replace(/__(_)?/g, (_, match) => {
		if (match) return ++i % 2 ? `${match}\\_\\_` : `\\_\\_${match}`;
		return '\\_\\_';
	});
}

export default escapeUnderline;

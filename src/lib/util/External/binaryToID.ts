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
 * Transforms a snowflake from a bit string to a decimal string.
 * @param binary Bit string to be transformed
 * @private
 */
export function binaryToID(binary: string): string {
	let dec = '';

	while (binary.length > 50) {
		const high = parseInt(binary.slice(0, -32), 2);
		const low = parseInt((high % 10).toString(2) + binary.slice(-32), 2);

		dec = (low % 10).toString() + dec;
		binary
			= Math.floor(high / 10).toString(2) +
			Math.floor(low / 10)
				.toString(2)
				.padStart(32, '0');
	}

	let num = parseInt(binary, 2);
	while (num > 0) {
		dec = (num % 10).toString() + dec;
		num = Math.floor(num / 10);
	}

	return dec;
}

export default binaryToID;

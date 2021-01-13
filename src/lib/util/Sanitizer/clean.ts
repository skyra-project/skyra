/**
 * @license
 * MIT License
 *
 * Copyright (c) 2017-2019 dirigeants
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * @url https://github.com/dirigeants/utils/blob/cc5699d98c92356a483b2b2192ba446173294fe4/src/lib/clean.ts
 */
import { regExpEsc } from '@sapphire/utilities';

let sensitivePattern: string | RegExp | undefined = undefined;
const zws = String.fromCharCode(8203);

/**
 * Cleans sensitive info from strings
 * @since 0.0.1
 * @param text The text to clean
 */
export function clean(text: string) {
	if (typeof sensitivePattern === 'undefined') {
		throw new Error('initClean must be called before running this.');
	}
	return text.replace(sensitivePattern, '「ｒｅｄａｃｔｅｄ」').replace(/`/g, `\`${zws}`).replace(/@/g, `@${zws}`);
}

/**
 * Initializes the sensitive patterns for clean()
 * @param tokens The tokens to clean
 */
export function initClean(tokens: readonly string[]) {
	sensitivePattern = new RegExp(tokens.map(regExpEsc).join('|'), 'gi');
}

/**
 * MIT License
 *
 * Copyright (c) 2017 Gustaf Andersson
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
 */

/**
 * @param a The first string to compare
 * @param b The second string to compare
 * @param full Whether it should continue after distance 2 or continue
 */
export function levenshtein(a: string, b: string, full = true): number {
	if (a === b) return 0;
	if (a.length > b.length) [a, b] = [b, a];

	let la = a.length;
	let lb = b.length;

	// add-on, try to not match if distance is over 2
	if (!full && lb - la > 2) return -1;

	while (la > 0 && a.charCodeAt(la - 1) === b.charCodeAt(lb - 1)) {
		la--;
		lb--;
	}

	let offset = 0;

	while (offset < la && a.charCodeAt(offset) === b.charCodeAt(offset)) offset++;

	la -= offset;
	lb -= offset;

	if (la === 0 || lb < 3) return lb;

	return full ? fullLevenshtein(a, b, la, lb, offset) : -1;
}

function min(d0: number, d1: number, d2: number, bx: number, ay: number): number {
	return d0 < d1 || d2 < d1 ? (d0 > d2 ? d2 + 1 : d0 + 1) : bx === ay ? d1 : d1 + 1;
}

function fullLevenshtein(a: string, b: string, la: number, lb: number, offset: number): number {
	let x = 0;
	let y = 0;
	let d0: number | undefined = undefined;
	let d1: number | undefined = undefined;
	let d2: number | undefined = undefined;
	let d3: number | undefined = undefined;
	let dd: number | undefined = undefined;
	let dy: number | undefined = undefined;
	let ay: number | undefined = undefined;
	let bx0: number | undefined = undefined;
	let bx1: number | undefined = undefined;
	let bx2: number | undefined = undefined;
	let bx3: number | undefined = undefined;

	const vector: number[] = [];

	while (y < la) {
		vector.push(y + 1, a.charCodeAt(offset + y++));
	}

	while (x + 3 < lb) {
		bx0 = b.charCodeAt(offset + (d0 = x));
		bx1 = b.charCodeAt(offset + (d1 = x + 1));
		bx2 = b.charCodeAt(offset + (d2 = x + 2));
		bx3 = b.charCodeAt(offset + (d3 = x + 3));
		x += 4;
		dd = x;
		for (y = 0; y < vector.length; y += 2) {
			dy = vector[y];
			ay = vector[y + 1];
			d0 = min(dy, d0, d1, bx0, ay);
			d1 = min(d0, d1, d2, bx1, ay);
			d2 = min(d1, d2, d3, bx2, ay);
			dd = min(d2, d3, dd, bx3, ay);
			vector[y] = dd;
			d3 = d2;
			d2 = d1;
			d1 = d0;
			d0 = dy;
		}
	}

	while (x < lb) {
		bx0 = b.charCodeAt(offset + (d0 = x));
		dd = ++x;
		for (y = 0; y < vector.length; y += 2) {
			dy = vector[y];
			dd = dy < d0 || dd < d0 ? (dy > dd ? dd + 1 : dy + 1) : bx0 === vector[y + 1] ? d0 : d0 + 1;
			vector[y] = dd;
			d0 = dy;
		}
	}

	return dd!;
}

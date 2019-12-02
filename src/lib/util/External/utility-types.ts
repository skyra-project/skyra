/**
 * MIT License
 *
 * Copyright (c) 2016 Piotr Witek <piotrek.witek@gmail.com> (http://piotrwitek.github.io)
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
 * DeepRequired
 * @desc Required that works for deeply nested structure
 * @example
 *   // Expect: {
 *   //   first: {
 *   //     second: {
 *   //       name: string;
 *   //     };
 *   //   };
 *   // }
 *   type NestedProps = {
 *     first?: {
 *       second?: {
 *         name?: string | null;
 *       };
 *     };
 *   };
 *   type RequiredNestedProps = DeepRequired<NestedProps>;
 */
export type DeepRequired<T> = T extends (...args: any[]) => any
	? T
	: T extends any[]
		? DeepRequiredArray<T[number]>
		: T extends object
			? DeepRequiredObject<T>
			: T;
/** @private */
// tslint:disable-next-line:class-name
export interface DeepRequiredArray<T>
	extends Array<DeepRequired<NonNullOrUndefined<T>>> {}

/** @private */
export type DeepRequiredObject<T> = {
	[P in keyof T]-?: DeepRequired<NonNullOrUndefined<T[P]>>;
};

/**
 * DeepRequiredUndefined
 * @desc Required that works for deeply nested structure
 * @example
 *   // Expect: {
 *   //   first: {
 *   //     second: {
 *   //       name: string;
 *   //     };
 *   //   };
 *   // }
 *   type NestedProps = {
 *     first?: {
 *       second?: {
 *         name?: string;
 *       };
 *     };
 *   };
 *   type RequiredNestedProps = DeepRequiredUndefined<NestedProps>;
 */
export type DeepRequiredUndefined<T> = T extends (...args: any[]) => any
	? T
	: T extends any[]
		? DeepRequiredUndefinedArray<T[number]>
		: T extends object
			? DeepRequiredUndefinedObject<T>
			: T;
/** @private */
// tslint:disable-next-line:class-name
export interface DeepRequiredUndefinedArray<T>
	extends Array<DeepRequiredUndefined<NonUndefined<T>>> {}

/** @private */
export type DeepRequiredUndefinedObject<T> = {
	[P in keyof T]-?: DeepRequiredUndefined<NonUndefined<T[P]>>;
};

/**
 * DeepRequiredNull
 * @desc Required that works for deeply nested structure
 * @example
 *   // Expect: {
 *   //   first?: {
 *   //     second?: {
 *   //       name: string;
 *   //     };
 *   //   };
 *   // }
 *   type NestedProps = {
 *     first?: {
 *       second?: {
 *         name?: string;
 *       };
 *     };
 *   };
 *   type RequiredNestedProps = DeepRequiredNull<NestedProps>;
 */
export type DeepRequiredNull<T> = T extends (...args: any[]) => any
	? T
	: T extends any[]
		? DeepRequiredNullArray<T[number]>
		: T extends object
			? DeepRequiredNullObject<T>
			: T;
/** @private */
// tslint:disable-next-line:class-name
export interface DeepRequiredNullArray<T>
	extends Array<DeepRequiredNull<NonNull<T>>> {}

/** @private */
export type DeepRequiredNullObject<T> = {
	[P in keyof T]-?: DeepRequiredNull<NonNull<T[P]>>;
};

/**
 * NonUndefined
 * @desc Exclude undefined from set `A`
 * @example
 *   // Expect: "string | null"
 *   SymmetricDifference<string | null | undefined>;
 */
export type NonUndefined<A> = A extends undefined ? never : A;

/**
 * NonNull
 * @desc Exclude null from set `A`
 * @example
 *   // Expect: "string | undefined"
 *   SymmetricDifference<string | null | undefined>;
 */
export type NonNull<A> = A extends null ? never : A;

/**
 * NonNullOrUndefined
 * @desc Exclude null and undefined from set `A`
 * @example
 *   // Expect: "string"
 *   SymmetricDifference<string>;
 */
export type NonNullOrUndefined<A> = A extends null ? A extends undefined ? never : never : Exclude<A, null | undefined>;

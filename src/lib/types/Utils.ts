/* eslint-disable @typescript-eslint/ban-types */

// TODO(favna): Remove this when https://github.com/discordjs/discord.js/pull/6808 is merged and published
export type EnumHolder<T> = { [P in keyof T]: T[P] };
// TODO(favna): Remove this when https://github.com/discordjs/discord.js/pull/6808 is merged and published
export type ExcludeEnum<T, K extends keyof T> = Exclude<keyof T | T[keyof T], K | T[K]>;

export type CustomGet<K extends string, TCustom> = K & { __type__: TCustom };

export function T<TCustom = string>(k: string): CustomGet<string, TCustom> {
	return k as CustomGet<string, TCustom>;
}

export type CustomFunctionGet<K extends string, TArgs, TReturn> = K & { __args__: TArgs; __return__: TReturn };

export function FT<TArgs, TReturn = string>(k: string): CustomFunctionGet<string, TArgs, TReturn> {
	return k as CustomFunctionGet<string, TArgs, TReturn>;
}

export interface Value<T = string> {
	value: T;
}

export interface Values<T = string> {
	values: readonly T[];
	count: number;
}

export interface Difference<T = string> {
	previous: T;
	next: T;
}

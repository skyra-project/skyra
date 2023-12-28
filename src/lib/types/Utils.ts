/* eslint-disable @typescript-eslint/ban-types */
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

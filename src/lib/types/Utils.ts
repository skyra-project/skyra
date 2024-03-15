/* eslint-disable @typescript-eslint/ban-types */
export type TypedT<TCustom = string> = string & { __type__: TCustom };
export type GetTypedT<T extends TypedT<unknown>> = T extends TypedT<infer U> ? U : never;

export function T<TCustom = string>(k: string): TypedT<TCustom> {
	return k as TypedT<TCustom>;
}

export type TypedFT<TArgs, TReturn> = string & { __args__: TArgs; __return__: TReturn };
export type GetTypedFTArgs<T extends TypedFT<unknown, unknown>> = T extends TypedFT<infer U, unknown> ? U : never;
export type GetTypedFTReturn<T extends TypedFT<unknown, unknown>> = T extends TypedFT<unknown, infer U> ? U : never;

export function FT<TArgs, TReturn = string>(k: string): TypedFT<TArgs, TReturn> {
	return k as TypedFT<TArgs, TReturn>;
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

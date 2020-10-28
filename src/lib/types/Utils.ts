/* eslint-disable @typescript-eslint/ban-types */

export type CustomGet<K extends string, TCustom> = K & { __type__: TCustom };

export function T<TCustom>(k: string): CustomGet<string, TCustom> {
	return k as CustomGet<string, TCustom>;
}

export type CustomFunctionGet<K extends string, TArgs, TReturn> = K & { __args__: TArgs; __return__: TReturn };

export function FT<TArgs, TReturn>(k: string): CustomFunctionGet<string, TArgs, TReturn> {
	return k as CustomFunctionGet<string, TArgs, TReturn>;
}

export type AnyObject = Record<PropertyKey, unknown> | {};

export type KeyOfType<T, V> = {
	[P in keyof T]: T[P] extends V ? P : never;
}[keyof T];

export type Mutable<T> = {
	-readonly [P in keyof T]: T[P] extends Array<unknown> | AnyObject | {} ? Mutable<T[P]> : T[P];
};

export type StrictRequired<T> = {
	[P in keyof T]-?: NonNullable<T[P]>;
};

export type ArrayElementType<T> = T extends (infer K)[] ? K : T extends readonly (infer RK)[] ? RK : T;

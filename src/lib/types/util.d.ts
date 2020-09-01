/* eslint-disable @typescript-eslint/ban-types */

export type AnyObject = Record<PropertyKey, unknown> | {};

export type Mutable<T> = {
	-readonly [P in keyof T]: T[P] extends Array<unknown> | AnyObject | {} ? Mutable<T[P]> : T[P];
};

export type StrictRequired<T> = {
	[P in keyof T]-?: NonNullable<T[P]>;
};

export type ArrayElementType<T> = T extends (infer K)[] ? K : T extends readonly (infer RK)[] ? RK : T;

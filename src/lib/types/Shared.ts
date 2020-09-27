export type CustomGet<K extends string, TCustom> = K & { __type__: TCustom };

export function T<TCustom>(k: string): CustomGet<string, TCustom> {
	return k as CustomGet<string, TCustom>;
}

export type CustomFunctionGet<K extends string, TArgs, TReturn> = K & { __args__: TArgs; __return__: TReturn };

export function FT<TArgs, TReturn>(k: string): CustomFunctionGet<string, TArgs, TReturn> {
	return k as CustomFunctionGet<string, TArgs, TReturn>;
}

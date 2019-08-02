export type Mutable<T> = {
	-readonly [P in keyof T]: T[P] extends Array<any> | Record<any, any> | {} ? Mutable<T[P]> : T[P];
};

export type ArrayElementType<T> = T extends (infer K)[] ? K : T extends readonly (infer RK)[] ? RK : T;

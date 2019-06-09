export type Mutable<T> = {
	-readonly [P in keyof T]: T[P] extends Array<any> | Record<any, any> | {} ? Mutable<T[P]> : T[P];
};

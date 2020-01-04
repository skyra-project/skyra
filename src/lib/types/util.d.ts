import { Provider, SettingsUpdateResults } from 'klasa';

export type AnyObject = Record<keyof any, unknown> | {};

export type Mutable<T> = {
	-readonly [P in keyof T]: T[P] extends Array<unknown> | AnyObject | {} ? Mutable<T[P]> : T[P];
};

export type ArrayElementType<T> = T extends (infer K)[] ? K : T extends readonly (infer RK)[] ? RK : T;

export class JsonProvider extends Provider {

	public createTable(table: string, rows?: readonly [string, string][]): Promise<unknown>;
	public deleteTable(table: string): Promise<unknown>;
	public hasTable(table: string): Promise<boolean>;
	public create(table: string, entry: string, data: object): Promise<unknown>;
	public delete(table: string, entry: string): Promise<unknown>;
	public get(table: string, entry: string): Promise<object | null>;
	public getAll(table: string, entries?: readonly string[]): Promise<object[]>;
	public getKeys(table: string): Promise<string[]>;
	public has(table: string, entry: string): Promise<boolean>;
	public update(table: string, entry: string, data: object | SettingsUpdateResults): Promise<unknown>;
	public replace(table: string, entry: string, data: object | SettingsUpdateResults): Promise<unknown>;

}

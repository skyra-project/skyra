import { Provider, SettingsFolderUpdateResult } from 'klasa';

export type AnyObject = Record<keyof any, unknown> | {};

export type Mutable<T> = {
	-readonly [P in keyof T]: T[P] extends Array<unknown> | AnyObject | {} ? Mutable<T[P]> : T[P];
};

export type ArrayElementType<T> = T extends (infer K)[] ? K : T extends readonly (infer RK)[] ? RK : T;

export class JsonProvider extends Provider {

	public create(table: string, entry: string, data: any): Promise<unknown>;
	public createTable(table: string, rows?: any[]): Promise<unknown>;
	public delete(table: string, entry: string): Promise<unknown>;
	public deleteTable(table: string): Promise<unknown>;
	public get(table: string, entry: string): Promise<unknown>;
	public getAll(table: string, entries?: readonly string[]): Promise<unknown[]>;
	public has(table: string, entry: string): Promise<boolean>;
	public hasTable(table: string): Promise<boolean>;
	public update(table: string, entry: string, data: SettingsFolderUpdateResult[] | [string, unknown][] | AnyObject): Promise<unknown>;
	public replace(table: string, entry: string, data: SettingsFolderUpdateResult[] | [string, unknown][] | AnyObject): Promise<unknown>;

}

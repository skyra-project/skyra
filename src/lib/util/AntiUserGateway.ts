// TODO: Switch to @skyra/anti-user-gateway once we move to @klasa/core

import { IdKeyed, RequestHandler } from '@klasa/request-handler';
import { Gateway, GatewayStorage, Settings, SettingsExistenceStatus, SettingsFolderJson, SettingsUpdateResults } from '@klasa/settings-gateway';
import { SkyraClient } from '@lib/SkyraClient';
import { KlasaUserStore } from 'klasa';
import { container } from 'tsyringe';

/* eslint-disable @typescript-eslint/class-literal-property-style */

// Step 1: Remove UserStore#fetch
Reflect.deleteProperty(KlasaUserStore.prototype, 'fetch');

// Step 2: Create UserSettings, which is an empty Settings-like class, implements:
//         Settings, SettingsFolder, and Map<string, unknown>.

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class UserSettings implements Settings {

	public get id(): string {
		return '';
	}

	public get gateway(): Gateway {
		return container.resolve(SkyraClient).gateways.get('users') as Gateway;
	}

	public get target(): unknown {
		return { id: this.id };
	}

	public get schema() {
		return this.gateway.schema;
	}

	public get size() {
		return 0;
	}

	public get base(): Settings | null {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return this;
	}

	public get existenceStatus(): SettingsExistenceStatus {
		return SettingsExistenceStatus.Unsynchronized;
	}

	public get [Symbol.toStringTag](): string {
		return 'Map';
	}

	public increase(): Promise<SettingsUpdateResults> {
		return Promise.resolve([]);
	}

	public decrease(): Promise<SettingsUpdateResults> {
		return Promise.resolve([]);
	}

	public clone(): Settings {
		return Object.create(this);
	}

	public sync(): Promise<this> {
		return Promise.resolve(this);
	}

	public destroy(): Promise<this> {
		return Promise.resolve(this);
	}

	public get client() {
		return this.gateway.client;
	}

	public get(): unknown {
		return undefined;
	}

	public pluck(): unknown[] {
		return [];
	}

	public resolve(): Promise<unknown[]> {
		return Promise.resolve([]);
	}

	public reset(): Promise<SettingsUpdateResults> {
		return Promise.resolve([]);
	}

	public update(): Promise<SettingsUpdateResults> {
		return Promise.resolve([]);
	}

	public toJSON(): SettingsFolderJson {
		return {};
	}

	public clear(): void {
		// noop
	}

	public delete(): boolean {
		return false;
	}

	public forEach(): void {
		// noop
	}

	public has(): boolean {
		return false;
	}

	public set(): this {
		return this;
	}

	public [Symbol.iterator](): IterableIterator<[string, unknown]> {
		throw new Error('Method not implemented.');
	}

	public entries(): IterableIterator<[string, unknown]> {
		throw new Error('Method not implemented.');
	}

	public keys(): IterableIterator<string> {
		throw new Error('Method not implemented.');
	}

	public values(): IterableIterator<unknown> {
		throw new Error('Method not implemented.');
	}

	protected _patch(): void {
		// noop
	}

	protected _init(): void {
		// noop
	}

	protected _save(): Promise<void> {
		return Promise.resolve();
	}

	protected _resolveFolder(): void {
		// noop
	}

	protected _resolveEntry(): void {
		// noop
	}

	protected _resetSettingsFolder(): void {
		// noop
	}

	protected _resetSettingsEntry(): void {
		// noop
	}

	protected _processUpdate(): void {
		// noop
	}

	protected _updateSettingsEntry(): void {
		// noop
	}

	protected _updateSettingsEntryNotIndexed(): void {
		// noop
	}

	protected _updateSettingsEntryAtIndex(): void {
		// noop
	}

	protected _resolveValues(): void {
		// noop
	}

	protected _resolveNextValue(): void {
		// noop
	}

	protected _updateSchemaEntryValue(): void {
		// noop
	}

}

// Step 3: Create UserGateway, which is an empty Gateway-like class, implements:
//         Gateway.
export class UserGateway extends GatewayStorage implements Gateway {

	public cache = new Map();
	public requestHandler = new RequestHandler<string, IdKeyed<string>>(
		id => Promise.resolve({ id }),
		ids => Promise.resolve(ids.map(id => ({ id })))
	);

	public acquire(): Settings {
		return this.create();
	}

	public get(): Settings | null {
		return null;
	}

	public create(): Settings {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return new UserSettings();
	}

	public sync(): Promise<this> {
		return Promise.resolve(this);
	}

}

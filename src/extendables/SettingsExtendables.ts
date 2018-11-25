// @ts-nocheck
import { ExtendableStore, KlasaClient, SettingsFolder, SettingsFolderUpdateResult } from 'klasa';

export default class extends Extendable {

	public constructor(client: KlasaClient, store: ExtendableStore, file: string[], directory: string) {
		super(client, store, file, directory, { appliesTo: [SettingsFolder] });
	}

	public increase(key: string, value: number): Promise<SettingsFolderUpdateResult> {
		return this.update(key, this.get(key) + value);
	}

	public decrease(key: string, value: number): Promise<SettingsFolderUpdateResult> {
		return this.update(key, this.get(key) - value);
	}

}

declare module 'klasa' {
	export interface SettingsFolder {
		increase(key: string, value: number): Promise<SettingsFolderUpdateResult>;
		decrease(key: string, value: number): Promise<SettingsFolderUpdateResult>;
	}
}

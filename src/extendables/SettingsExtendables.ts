import { ExtendableStore, KlasaClient, SettingsFolder, SettingsFolderUpdateResult } from 'klasa';

export default class extends Extendable {

	public constructor(client: KlasaClient, store: ExtendableStore, file: string[], directory: string) {
		super(client, store, file, directory, { appliesTo: [SettingsFolder] });
	}

	public increase(key: string, value: number) {
		const self = this as SettingsFolder;
		return self.update(key, this.get(key) + value);
	}

	public decrease(key: string, value: number) {
		const self = this as SettingsFolder;
		return self.update(key, this.get(key) - value);
	}

}

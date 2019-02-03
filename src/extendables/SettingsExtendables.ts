import { Extendable, ExtendableStore, KlasaClient, SettingsFolder } from 'klasa';

export default class extends Extendable {

	public constructor(client: KlasaClient, store: ExtendableStore, file: string[], directory: string) {
		super(client, store, file, directory, { appliesTo: [SettingsFolder] });
	}

	public increase(key: string, value: number) {
		const self = this as unknown as SettingsFolder;
		return self.update(key, (self.get(key) as number) + value);
	}

	public decrease(key: string, value: number) {
		const self = this as unknown as SettingsFolder;
		return self.update(key, (self.get(key) as number) - value);
	}

}

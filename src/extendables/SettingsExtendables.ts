import { Extendable, ExtendableStore, SettingsFolder } from 'klasa';

export default class extends Extendable {

	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [SettingsFolder] });
	}

	public increase(this: SettingsFolder, key: string, value: number) {
		return this.update(key, (this.get(key) as number) + value);
	}

	public decrease(this: SettingsFolder, key: string, value: number) {
		return this.update(key, (this.get(key) as number) - value);
	}

}

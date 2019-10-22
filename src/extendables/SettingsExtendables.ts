import { Extendable, ExtendableOptions, SettingsFolder } from 'klasa';
import { ApplyOptions } from '../lib/util/util';

@ApplyOptions<ExtendableOptions>({
	appliesTo: [SettingsFolder]
})
export default class extends Extendable {

	public increase(this: SettingsFolder, key: string, value: number) {
		return this.update(key, (this.get(key) as number) + value);
	}

	public decrease(this: SettingsFolder, key: string, value: number) {
		return this.update(key, (this.get(key) as number) - value);
	}

}

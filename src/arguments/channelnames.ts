import { MultiArgument } from '../index';

export default class extends MultiArgument {

	public get base() {
		return this.store.get('channelname');
	}

}

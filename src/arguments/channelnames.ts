import { MultiArgument } from 'klasa';

export default class extends MultiArgument {

	public get base(): any {
		return this.store.get('channelname');
	}

}

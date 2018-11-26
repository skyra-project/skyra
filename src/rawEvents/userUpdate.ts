import { RawEvent } from '../lib/structures/RawEvent';
import { APIUserData } from '../lib/types/Discord';

export default class extends RawEvent {

	public async run(data: APIUserData): Promise<void> {
		const user = this.client.users.get(data.id);
		// @ts-ignore
		if (user) user._patch(data);
	}

}

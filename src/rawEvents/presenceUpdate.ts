const { RawEvent } = require('../index');

export default class extends RawEvent {

	public constructor(client: Skyra, store: RawEventStore, file: string[], directory: string) {
		super(client, store, file, directory, { name: 'PRESENCE_UPDATE' });
	}

	public process(data) {
		const user = this.client.users.get(data.user.id);
		if (user) user._patch(data.user);
	}

}

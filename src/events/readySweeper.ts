import { Event, EventStore } from 'klasa';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { event: 'ready' });
	}

	public async run() {
		// Populate the usernames
		for (const user of this.client.users.values()) {
			this.client.usertags.set(user.id, user.tag);
		}

		// Clear all users
		this.client.users.clear();

		// Fill the dictionary name for faster user fetching
		for (const guild of this.client.guilds.values()) {
			const me = guild!.me!;

			// Populate the snowflakes
			for (const member of guild!.members.values()) {
				guild!.memberSnowflakes.add(member.id);
			}

			// Clear all members
			guild!.members.clear();
			guild!.members.set(me.id, me);
			guild!.presences.clear();
			guild!.emojis.clear();
		}
	}

}

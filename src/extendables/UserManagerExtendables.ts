import { User, UserManager } from 'discord.js';
import { Extendable, ExtendableStore } from 'klasa';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [UserManager] });
	}

	public getFromTag(this: UserManager, tag: string): User | null {
		const pieces = tag.split('#');
		if (pieces.length !== 2 || pieces[1].length !== 4) return null;

		const [username, discriminator] = pieces;
		for (const user of this.cache.values()) {
			if (username === user.username && discriminator === user.discriminator) return user;
		}

		return null;
	}
}

import { VoiceChannel } from 'discord.js';
import { Extendable, ExtendableStore } from 'klasa';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [VoiceChannel] });
	}

	// @ts-expect-error 2784 https://github.com/microsoft/TypeScript/issues/36883
	public get listeners(this: VoiceChannel): string[] {
		const members: string[] = [];
		for (const [id, member] of this.members.entries()) {
			if (member.user.bot || member.voice.deaf) continue;
			members.push(id);
		}

		return members;
	}
}

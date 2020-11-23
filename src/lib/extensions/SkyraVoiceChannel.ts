import { Structures } from 'discord.js';

export class SkyraVoiceChannel extends Structures.get('VoiceChannel') {
	public get listeners(): string[] {
		const members: string[] = [];
		for (const [id, member] of this.members.entries()) {
			if (member.user.bot || member.voice.deaf) continue;
			members.push(id);
		}

		return members;
	}
}

declare module 'discord.js' {
	export interface VoiceChannel {
		readonly listeners: string[];
	}
}

Structures.extend('VoiceChannel', () => SkyraVoiceChannel);

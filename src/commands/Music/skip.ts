import { Snowflake } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { Queue } from '../../lib/structures/music/Queue';
import { MusicCommand } from '../../lib/structures/MusicCommand';

export default class extends MusicCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_SKIP_DESCRIPTION'),
			music: ['QUEUE_NOT_EMPTY'],
			usage: '[force]'
		});
	}

	public async run(message: KlasaMessage, [force = false]: [boolean]) {
		const { music } = message.guild!;

		if (music.listeners.length >= 4) {
			if (force) {
				if (!await message.hasAtLeastPermissionLevel(5)) throw message.language.tget('COMMAND_SKIP_PERMISSIONS');
			} else {
				const response = this.handleSkips(music, message.author.id);
				if (response) return message.sendMessage(response);
			}
		}

		const song = (await music.skip())!;
		return message.sendLocale('COMMAND_SKIP_SUCCESS', [song.safeTitle]);
	}

	public handleSkips(musicManager: Queue, user: Snowflake): string | false {
		const song = musicManager.song! || musicManager[0];
		if (song.skips.has(user)) return musicManager.guild.language.tget('COMMAND_SKIP_VOTES_VOTED');
		song.skips.add(user);
		const members = musicManager.listeners.length;
		return this.shouldInhibit(musicManager, members, song.skips.size);
	}

	public shouldInhibit(musicManager: Queue, total: number, size: number): false | string {
		if (total <= 3) return false;

		const needed = Math.ceil(total * 0.4);
		return size >= needed ? false : musicManager.guild.language.tget('COMMAND_SKIP_VOTES_TOTAL', size, needed);
	}

}

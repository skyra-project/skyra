import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { GuildMessage } from '@lib/types/Discord';
import { Events } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<MusicCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Music.AddDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Music.AddExtended),
	usage: '<song:song>',
	flagSupport: true
})
export default class extends MusicCommand {
	public async run(message: GuildMessage, [songs]: [string[]]) {
		if (!songs || !songs.length) throw message.language.get(LanguageKeys.MusicManager.FetchNoMatches);

		const tracks = songs.map((track) => ({ author: message.author.id, track }));
		await message.guild.audio.add(...tracks);
		this.client.emit(Events.MusicAddNotify, message.channel, tracks);
	}
}

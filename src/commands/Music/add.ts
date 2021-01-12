import { MusicCommand } from '#lib/structures/MusicCommand';
import { GuildMessage } from '#lib/types/Discord';
import { Events } from '#lib/types/Enums';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { requireUserInVoiceChannel } from '#utils/Music/Decorators';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<MusicCommand.Options>({
	description: LanguageKeys.Commands.Music.AddDescription,
	extendedHelp: LanguageKeys.Commands.Music.AddExtended,
	usage: '<song:song>',
	flagSupport: true
})
export default class extends MusicCommand {
	@requireUserInVoiceChannel()
	public async run(message: GuildMessage, [songs]: [string[]]) {
		if (!songs || !songs.length) throw await message.resolveKey(LanguageKeys.MusicManager.FetchNoMatches);

		const tracks = songs.map((track) => ({ author: message.author.id, track }));
		await message.guild.audio.add(...tracks);
		this.client.emit(Events.MusicAddNotify, message, tracks);
	}
}

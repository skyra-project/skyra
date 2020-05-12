import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';
import { Track } from 'lavalink';

@ApplyOptions<MusicCommandOptions>({
	description: language => language.tget('COMMAND_ADD_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_ADD_EXTENDED'),
	usage: '<song:song>',
	flagSupport: true
})
export default class extends MusicCommand {

	public run(message: KlasaMessage, [songs]: [Track[]]) {
		message.guild!.music.add(message.author.id, songs, this.getContext(message));
	}

}

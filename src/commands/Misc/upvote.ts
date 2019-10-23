import { CommandOptions, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { ApplyOptions } from '../../lib/util/util';

@ApplyOptions<CommandOptions>({
	aliases: ['updoot'],
	description: language => language.tget('COMMAND_UPVOTE_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_UPVOTE_EXTENDED')
})
export default class extends SkyraCommand {

	public run(message: KlasaMessage) {
		return message.sendLocale('COMMAND_UPVOTE_MESSAGE');
	}

}

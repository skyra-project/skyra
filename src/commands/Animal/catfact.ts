import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { SkyraCommand, SkyraCommandOptions } from '../../lib/structures/SkyraCommand';
import { ApplyOptions, fetch, getColor } from '../../lib/util/util';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['kittenfact'],
	cooldown: 10,
	description: language => language.tget('COMMAND_CATFACT_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_CATFACT_EXTENDED'),
	requiredPermissions: ['EMBED_LINKS'],
	spam: true
})
export default class extends SkyraCommand {

	public async run(message: KlasaMessage) {
		const { fact } = await fetch('https://catfact.ninja/fact', 'json') as CatfactResultOk;
		return message.sendEmbed(new MessageEmbed()
			.setColor(getColor(message) || 0xFFAB2D)
			.setTitle(message.language.tget('COMMAND_CATFACT_TITLE'))
			.setDescription(fact));
	}

}

export interface CatfactResultOk {
	fact: string;
	length: number;
}

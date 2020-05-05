import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { Colors } from '@lib/types/constants/Constants';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['suggest'],
	bucket: 2,
	cooldown: 20,
	description: language => language.tget('COMMAND_FEEDBACK_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_FEEDBACK_EXTENDED'),
	guarded: true,
	usage: '<message:string{8,1900}>'
})
export default class extends SkyraCommand {

	public async run(message: KlasaMessage, [feedback]: [string]) {
		if (message.deletable) message.nuke().catch(() => null);

		await this.client.webhookFeedback!.send(new MessageEmbed()
			.setColor(Colors.Green)
			.setAuthor(`${message.author.tag}`, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setDescription(feedback)
			.setFooter(`${message.author.id} | Feedback`)
			.setTimestamp());
		return message.alert(message.language.tget('COMMAND_FEEDBACK'));
	}

	public async init() {
		if (this.client.webhookFeedback === null) this.disable();
	}

}

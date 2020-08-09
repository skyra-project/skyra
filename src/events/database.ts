import { codeBlock } from '@klasa/utils';
import { Colors } from '@lib/types/constants/Constants';
import { Events } from '@lib/types/Enums';
import { rootFolder } from '@utils/constants';
import { inlineCodeblock } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { Command, Event, KlasaMessage } from 'klasa';
import { QueryFailedError } from 'typeorm';

export default class extends Event {
	public async run(message: KlasaMessage, command: Command, error: QueryFailedError) {
		const output = [
			`${inlineCodeblock('Command   ::')} ${command.path.slice(rootFolder.length)}`,
			`${inlineCodeblock('Arguments ::')} ${message.args.length ? `[\`${message.args.join('`, `')}\`]` : 'Not Supplied'}`,
			`${inlineCodeblock('Error     ::')} ${codeBlock('js', error.stack || error)}`
		].join('\n');

		try {
			await this.client.webhookDatabase!.send(
				new MessageEmbed()
					.setDescription(output)
					.setColor(Colors.Red)
					.setAuthor(message.author.tag, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }), message.url)
					.setTimestamp()
			);
		} catch (err) {
			this.client.emit(Events.Wtf, err);
		}
	}
}

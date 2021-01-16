import { Colors } from '#lib/types/Constants';
import { rootFolder } from '#utils/constants';
import { codeBlock, inlineCodeBlock } from '@sapphire/utilities';
import { Message, MessageEmbed } from 'discord.js';
import { Command, Event } from 'klasa';
import type { QueryFailedError } from 'typeorm';

export default class extends Event {
	public async run(message: Message, command: Command, error: QueryFailedError) {
		const output = [
			`${inlineCodeBlock('Command   ::')} ${command.path.slice(rootFolder.length)}`,
			`${inlineCodeBlock('Arguments ::')} ${message.args.length ? `[\`${message.args.join('`, `')}\`]` : 'Not Supplied'}`,
			`${inlineCodeBlock('Error     ::')} ${codeBlock('js', error.stack || error)}`
		].join('\n');

		await this.client.webhookDatabase!.send(
			new MessageEmbed()
				.setDescription(output)
				.setColor(Colors.Red)
				.setAuthor(message.author.tag, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }), message.url)
				.setTimestamp()
		);
	}
}

import { diffWordsWithSpace } from 'diff';
import { MessageEmbed, TextChannel, Util } from 'discord.js';
import { Event, KlasaMessage } from 'klasa';
import { MessageLogsEnum } from '../lib/util/constants';

export default class extends Event {

	public async run(old: KlasaMessage, message: KlasaMessage): Promise<void> {
		// Run monitors
		if (!this.client.ready || old.content === message.content) return;
		// tslint:disable-next-line:no-floating-promises
		this.client.monitors.run(message);

		if (!message.guild || message.author === this.client.user) return;

		const { guild } = message;
		if (!guild.settings.get('events.messageEdit')) return;

		this.client.emit('guildMessageLog', (message.channel as TextChannel).nsfw ? MessageLogsEnum.NSFWMessage : MessageLogsEnum.Message, guild, () => new MessageEmbed()
			.setColor(0xDCE775)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL(), message.url)
			.splitFields(diffWordsWithSpace(Util.escapeMarkdown(old.content), Util.escapeMarkdown(message.content))
				.map((result) => result.added ? `**${result.value}**` : result.removed ? `~~${result.value}~~` : result.value)
				.join(' '))
			.setFooter(`${message.language.get('EVENTS_MESSAGE_UPDATE')} | ${(message.channel as TextChannel).name}`)
			.setTimestamp());
	}

}

import { GuildMessage } from '@lib/types';
import { Colors } from '@lib/types/constants/Constants';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { cutText } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { MessageLogsEnum } from '@utils/constants';
import { getContent, getImage } from '@utils/util';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: Events.GuildMessageUpdate })
export default class extends Event {
	public async run(message: GuildMessage) {
		const [enabled, ignoredChannels, ignoredDeletes, ignoredAll, language] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.Events.MessageDelete],
			settings[GuildSettings.Messages.IgnoreChannels],
			settings[GuildSettings.Channels.Ignore.MessageDelete],
			settings[GuildSettings.Channels.Ignore.All],
			settings.getLanguage()
		]);

		if (!enabled) return;
		if (ignoredChannels.some((id) => id === message.channel.id || message.channel.parentID === id)) return;
		if (ignoredDeletes.some((id) => id === message.channel.id && message.channel.parentID === id)) return;
		if (ignoredAll.some((id) => id === message.channel.id || message.channel.parentID === id)) return;

		const channel = message.channel as TextChannel;
		this.client.emit(Events.GuildMessageLog, channel.nsfw ? MessageLogsEnum.NSFWMessage : MessageLogsEnum.Message, message.guild, () =>
			new MessageEmbed()
				.setColor(Colors.Red)
				.setAuthor(
					`${message.author.tag} (${message.author.id})`,
					message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true })
				)
				.setDescription(cutText(getContent(message) || '', 1900))
				.setFooter(`${language.get(LanguageKeys.Events.MessageDelete)} • ${channel.name}`)
				.setImage(getImage(message)!)
				.setTimestamp()
		);
	}
}

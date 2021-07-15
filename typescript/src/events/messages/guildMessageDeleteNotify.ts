import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types';
import { Colors } from '#lib/types/Constants';
import { Events } from '#lib/types/Enums';
import { getContent, getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import { cutText, isNullish } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<EventOptions>({ event: Events.GuildMessageDelete })
export class UserEvent extends Event {
	public async run(message: GuildMessage) {
		const key = GuildSettings.Channels.Logs[message.channel.nsfw ? 'MessageDeleteNsfw' : 'MessageDelete'];
		const [ignoredChannels, logChannelId, ignoredDeletes, ignoredAll, t] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.Messages.IgnoreChannels],
			settings[key],
			settings[GuildSettings.Channels.Ignore.MessageDelete],
			settings[GuildSettings.Channels.Ignore.All],
			settings.getLanguage()
		]);

		if (isNullish(logChannelId)) return;
		if (ignoredChannels.some((id) => id === message.channel.id || message.channel.parentID === id)) return;
		if (ignoredDeletes.some((id) => id === message.channel.id && message.channel.parentID === id)) return;
		if (ignoredAll.some((id) => id === message.channel.id || message.channel.parentID === id)) return;

		this.context.client.emit(Events.GuildMessageLog, message.guild, logChannelId, key, () =>
			new MessageEmbed()
				.setColor(Colors.Red)
				.setAuthor(
					`${message.author.tag} (${message.author.id})`,
					message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true })
				)
				.setDescription(cutText(getContent(message) || '', 1900))
				.setFooter(t(LanguageKeys.Events.Messages.MessageDelete, { channel: message.channel }))
				.setImage(getImage(message)!)
				.setTimestamp()
		);
	}
}

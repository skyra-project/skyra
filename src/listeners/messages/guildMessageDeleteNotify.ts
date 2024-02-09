import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Events, type GuildMessage } from '#lib/types';
import { Colors } from '#utils/constants';
import { getContent, getFullEmbedAuthor, getImages, setMultipleEmbedImages } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { isNsfwChannel } from '@sapphire/discord.js-utilities';
import { Listener } from '@sapphire/framework';
import { cutText, isNullish, isNullishOrEmpty } from '@sapphire/utilities';

@ApplyOptions<Listener.Options>({ event: Events.GuildMessageDelete })
export class UserListener extends Listener {
	public async run(message: GuildMessage) {
		const key = GuildSettings.Channels.Logs[isNsfwChannel(message.channel) ? 'MessageDeleteNsfw' : 'MessageDelete'];
		const [ignoredChannels, logChannelId, ignoredDeletes, ignoredAll, t] = await readSettings(message.guild, (settings) => [
			settings[GuildSettings.Messages.IgnoreChannels],
			settings[key],
			settings[GuildSettings.Channels.Ignore.MessageDelete],
			settings[GuildSettings.Channels.Ignore.All],
			settings.getLanguage()
		]);

		if (isNullish(logChannelId)) return;
		if (ignoredChannels.some((id) => id === message.channel.id || message.channel.parentId === id)) return;
		if (ignoredDeletes.some((id) => id === message.channel.id && message.channel.parentId === id)) return;
		if (ignoredAll.some((id) => id === message.channel.id || message.channel.parentId === id)) return;

		this.container.client.emit(Events.GuildMessageLog, message.guild, logChannelId, key, () => {
			const embed = new EmbedBuilder()
				.setColor(Colors.Red)
				.setAuthor(getFullEmbedAuthor(message.author, message.url))
				.setFooter({ text: t(LanguageKeys.Events.Messages.MessageDelete, { channel: `#${message.channel.name}` }) })
				.setTimestamp();

			const content = getContent(message);
			if (!isNullishOrEmpty(content)) embed.setDescription(cutText(content, 1900));

			return setMultipleEmbedImages(embed, getImages(message));
		});
	}
}

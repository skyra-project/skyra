import { readSettings } from '#lib/database';
import { getT } from '#lib/i18n';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#utils/constants';
import { getLogger } from '#utils/functions';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import type { CategoryChannel, NewsChannel, TextChannel, VoiceChannel } from 'discord.js';

type GuildBasedChannel = TextChannel | VoiceChannel | CategoryChannel | NewsChannel;

@ApplyOptions<Listener.Options>({ event: Events.ChannelDelete })
export class UserListener extends Listener<typeof Events.ChannelDelete> {
	public async run(channel: GuildBasedChannel) {
		const settings = await readSettings(channel.guild);
		await getLogger(channel.guild).send({
			key: 'channelsLogsChannelDelete',
			channelId: settings.channelsLogsChannelDelete,
			makeMessage: () => {
				const t = getT(settings.language);
				const changes = [...this.getChannelInformation(t, channel)];
				return new EmbedBuilder()
					.setColor(Colors.Red)
					.setAuthor({
						name: `${channel.name} (${channel.id})`,
						iconURL: channel.guild.iconURL({ size: 64, extension: 'png' }) ?? undefined
					})
					.setDescription(changes.join('\n'))
					.setFooter({ text: t(LanguageKeys.Events.Guilds.Logs.ChannelDelete) })
					.setTimestamp();
			}
		});
	}

	private *getChannelInformation(t: TFunction, channel: GuildBasedChannel) {
		if (channel.parentId) yield t(LanguageKeys.Events.Guilds.Logs.ChannelCreateParent, { value: `<#${channel.parentId}>` });
	}
}

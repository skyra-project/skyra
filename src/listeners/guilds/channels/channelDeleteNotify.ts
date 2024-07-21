import { readSettings, writeSettings } from '#lib/database';
import { getT } from '#lib/i18n';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#utils/constants';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import { isNullish } from '@sapphire/utilities';
import type { CategoryChannel, NewsChannel, TextChannel, VoiceChannel } from 'discord.js';

type GuildBasedChannel = TextChannel | VoiceChannel | CategoryChannel | NewsChannel;

@ApplyOptions<Listener.Options>({ event: Events.ChannelDelete })
export class UserListener extends Listener<typeof Events.ChannelDelete> {
	public async run(next: GuildBasedChannel) {
		const settings = await readSettings(next.guild);
		const channelId = settings.channelsLogsChannelDelete;
		if (isNullish(channelId)) return;

		const channel = next.guild.channels.cache.get(channelId) as TextChannel | undefined;
		if (channel === undefined) {
			await writeSettings(next.guild, [['channelsLogsChannelDelete', null]]);
			return;
		}

		const t = getT(settings.language);
		const changes = [...this.getChannelInformation(t, next)];
		const embed = new EmbedBuilder()
			.setColor(Colors.Red)
			.setAuthor({ name: `${next.name} (${next.id})`, iconURL: channel.guild.iconURL({ size: 64, extension: 'png' }) ?? undefined })
			.setDescription(changes.join('\n'))
			.setFooter({ text: t(LanguageKeys.Events.Guilds.Logs.ChannelDelete) })
			.setTimestamp();
		await channel.send({ embeds: [embed] });
	}

	private *getChannelInformation(t: TFunction, channel: GuildBasedChannel) {
		if (channel.parentId) yield t(LanguageKeys.Events.Guilds.Logs.ChannelCreateParent, { value: `<#${channel.parentId}>` });
	}
}

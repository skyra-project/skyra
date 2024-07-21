import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#utils/constants';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { Role, TextChannel } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.GuildRoleDelete })
export class UserListener extends Listener<typeof Events.GuildRoleDelete> {
	public async run(role: Role) {
		const settings = await readSettings(role);
		const channelId = settings.channelsLogsRoleDelete;
		if (isNullish(channelId)) return;

		const channel = role.guild.channels.cache.get(channelId) as TextChannel | undefined;
		if (channel === undefined) {
			await writeSettings(role, [[GuildSettings.Channels.Logs.RoleDelete, null]]);
			return;
		}

		const t = settings.getLanguage();
		const embed = new EmbedBuilder()
			.setColor(Colors.Red)
			.setAuthor({ name: `${role.name} (${role.id})`, iconURL: channel.guild.iconURL({ size: 64, extension: 'png' }) ?? undefined })
			.setFooter({ text: t(LanguageKeys.Events.Guilds.Logs.RoleDelete) })
			.setTimestamp();
		await channel.send({ embeds: [embed] });
	}
}

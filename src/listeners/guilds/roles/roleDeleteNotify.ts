import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, ListenerOptions } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { MessageEmbed, Role, TextChannel } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildRoleDelete })
export class UserListener extends Listener<typeof Events.GuildRoleDelete> {
	public async run(role: Role) {
		const [channelId, t] = await readSettings(role, (settings) => [settings[GuildSettings.Channels.Logs.RoleDelete], settings.getLanguage()]);
		if (isNullish(channelId)) return;

		const channel = role.guild.channels.cache.get(channelId) as TextChannel | undefined;
		if (channel === undefined) {
			await writeSettings(role, [[GuildSettings.Channels.Logs.RoleDelete, null]]);
			return;
		}

		const embed = new MessageEmbed()
			.setColor(Colors.Red)
			.setAuthor({ name: `${role.name} (${role.id})`, iconURL: channel.guild.iconURL({ size: 64, format: 'png', dynamic: true }) ?? undefined })
			.setFooter(t(LanguageKeys.Events.Guilds.Logs.RoleDelete))
			.setTimestamp();
		await channel.send({ embeds: [embed] });
	}
}

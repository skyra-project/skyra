import { readSettings } from '#lib/database';
import { getT } from '#lib/i18n';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#utils/constants';
import { getLogger } from '#utils/functions';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { Role } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.GuildRoleDelete })
export class UserListener extends Listener<typeof Events.GuildRoleDelete> {
	public async run(role: Role) {
		const settings = await readSettings(role);
		await getLogger(role.guild).send({
			key: 'channelsLogsRoleDelete',
			channelId: settings.channelsLogsRoleDelete,
			makeMessage: () => {
				const t = getT(settings.language);
				return new EmbedBuilder()
					.setColor(Colors.Red)
					.setAuthor({ name: `${role.name} (${role.id})`, iconURL: role.guild.iconURL({ size: 64, extension: 'png' }) ?? undefined })
					.setFooter({ text: t(LanguageKeys.Events.Guilds.Logs.RoleDelete) })
					.setTimestamp();
			}
		});
	}
}

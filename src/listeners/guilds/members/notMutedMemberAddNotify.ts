import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Events } from '#lib/types';
import { Colors } from '#utils/constants';
import { getFullEmbedAuthor } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { GuildMember } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.NotMutedMemberAdd })
export class UserListener extends Listener {
	public async run(member: GuildMember) {
		const key = GuildSettings.Channels.Logs.MemberAdd;
		const [logChannelId, t] = await readSettings(member, (settings) => [settings[key], settings.getLanguage()]);
		if (isNullish(logChannelId)) return;

		this.container.client.emit(Events.GuildMessageLog, member.guild, logChannelId, key, () =>
			new EmbedBuilder()
				.setColor(Colors.Green)
				.setAuthor(getFullEmbedAuthor(member.user))
				.setDescription(
					t(LanguageKeys.Events.Guilds.Members.GuildMemberAddDescription, {
						mention: member.toString(),
						time: Date.now() - member.user.createdTimestamp
					})
				)
				.setFooter({ text: t(LanguageKeys.Events.Guilds.Members.GuildMemberAdd) })
				.setTimestamp()
		);
	}
}

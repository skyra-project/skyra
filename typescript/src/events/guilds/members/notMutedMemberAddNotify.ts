import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#lib/types/Constants';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { GuildMember, MessageEmbed } from 'discord.js';

@ApplyOptions<EventOptions>({ event: Events.NotMutedMemberAdd })
export class UserEvent extends Event {
	public async run(member: GuildMember) {
		const key = GuildSettings.Channels.Logs.MemberAdd;
		const [logChannelId, t] = await member.guild.readSettings((settings) => [settings[key], settings.getLanguage()]);
		if (isNullish(logChannelId)) return;

		this.context.client.emit(Events.GuildMessageLog, member.guild, logChannelId, key, () =>
			new MessageEmbed()
				.setColor(Colors.Green)
				.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
				.setDescription(
					t(LanguageKeys.Events.Guilds.Members.GuildMemberAddDescription, {
						mention: member.toString(),
						time: Date.now() - member.user.createdTimestamp
					})
				)
				.setFooter(t(LanguageKeys.Events.Guilds.Members.GuildMemberAdd))
				.setTimestamp()
		);
	}
}

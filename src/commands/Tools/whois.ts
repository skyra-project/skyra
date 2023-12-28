import { SkyraEmbed } from '#lib/discord';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionsBits } from '#utils/bits';
import { map, months, seconds } from '#utils/common';
import { Colors, Emojis } from '#utils/constants';
import { getDisplayAvatar, getTag } from '#utils/util';
import { TimestampStyles, time } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { TFunction } from '@sapphire/plugin-i18next';
import { PermissionFlagsBits, type GuildMember, type Role, type User } from 'discord.js';

const sortRanks = (x: Role, y: Role) => Number(y.position > x.position) || Number(x.position === y.position) - 1;

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['userinfo', 'uinfo', 'user'],
	description: LanguageKeys.Commands.Tools.WhoisDescription,
	detailedDescription: LanguageKeys.Commands.Tools.WhoisExtended,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
})
export class UserCommand extends SkyraCommand {
	private readonly KeyPermissions = PermissionsBits.resolve([
		PermissionFlagsBits.BanMembers,
		PermissionFlagsBits.KickMembers,
		PermissionFlagsBits.ManageChannels,
		PermissionFlagsBits.ManageGuildExpressions,
		PermissionFlagsBits.ManageGuild,
		PermissionFlagsBits.ManageMessages,
		PermissionFlagsBits.ManageNicknames,
		PermissionFlagsBits.ManageRoles,
		PermissionFlagsBits.ManageWebhooks,
		PermissionFlagsBits.MentionEveryone
	]);

	public override async messageRun(message: GuildMessage, args: SkyraCommand.Args) {
		const user = args.finished ? message.author : await args.pick('userName');
		const member = await message.guild.members.fetch(user.id).catch(() => null);

		const embed = member ? this.member(args.t, member) : this.user(args.t, user);
		return send(message, { embeds: [embed] });
	}

	private user(t: TFunction, user: User) {
		const userCreatedAtTimestampSeconds = seconds.fromMilliseconds(user.createdTimestamp);

		const titles = t(LanguageKeys.Commands.Tools.WhoisUserTitles);
		const fields = t(LanguageKeys.Commands.Tools.WhoisUserFields, {
			user,
			userCreatedAt: time(userCreatedAtTimestampSeconds, TimestampStyles.ShortDateTime),
			userCreatedAtOffset: time(userCreatedAtTimestampSeconds, TimestampStyles.RelativeTime)
		});

		return new SkyraEmbed()
			.setColor(Colors.White)
			.setThumbnail(getDisplayAvatar(user, { size: 256 }))
			.setDescription(this.getUserInformation(user))
			.addFields({ name: titles.createdAt, value: fields.createdAt })
			.setFooter({ text: fields.footer, iconURL: getDisplayAvatar(this.container.client.user!, { size: 128 }) })
			.setTimestamp();
	}

	private member(t: TFunction, member: GuildMember) {
		const userCreatedAtTimestampSeconds = seconds.fromMilliseconds(member.user.createdTimestamp);
		const memberJoinedAtTimestampSeconds = seconds.fromMilliseconds(member.joinedTimestamp!);

		const titles = t(LanguageKeys.Commands.Tools.WhoisMemberTitles);
		const fields = t(LanguageKeys.Commands.Tools.WhoisMemberFields, {
			member,
			memberCreatedAt: time(userCreatedAtTimestampSeconds, TimestampStyles.ShortDateTime),
			memberCreatedAtOffset: time(userCreatedAtTimestampSeconds, TimestampStyles.RelativeTime),
			memberJoinedAt: time(memberJoinedAtTimestampSeconds, TimestampStyles.ShortDateTime),
			memberJoinedAtOffset: time(memberJoinedAtTimestampSeconds, TimestampStyles.RelativeTime)
		});

		const embed = new SkyraEmbed()
			.setColor(member.displayColor || Colors.White)
			.setThumbnail(getDisplayAvatar(member.user, { size: 256 }))
			.setDescription(this.getUserInformation(member.user, this.getBoostIcon(member.premiumSinceTimestamp)))
			.addFields({ name: titles.joined, value: member.joinedTimestamp ? fields.joinedWithTimestamp : fields.joinedUnknown, inline: true })
			.addFields({ name: titles.createdAt, value: fields.createdAt, inline: true })
			.setFooter({ text: fields.footer, iconURL: getDisplayAvatar(this.container.client.user!, { size: 128 }) })
			.setTimestamp();

		this.applyMemberRoles(t, member, embed);
		this.applyMemberKeyPermissions(t, member, embed);
		return embed;
	}

	private getUserInformation(user: User, extras = ''): string {
		const bot = user.bot ? ` ${Emojis.Bot}` : '';
		const avatar = `[Avatar ${Emojis.Frame}](${getDisplayAvatar(user, { size: 4096 })})`;
		return `**${getTag(user)}**${bot} - ${user.toString()}${extras} - ${avatar}`;
	}

	private applyMemberRoles(t: TFunction, member: GuildMember, embed: SkyraEmbed) {
		if (member.roles.cache.size <= 1) return;

		const roles = member.roles.cache.sorted(sortRanks);
		roles.delete(member.guild.id);
		embed.splitFields(t(LanguageKeys.Commands.Tools.WhoisMemberRoles, { count: roles.size }), [...roles.values()].join(' '));
	}

	private applyMemberKeyPermissions(t: TFunction, member: GuildMember, embed: SkyraEmbed) {
		const permissions = member.permissions.bitfield;

		// If the member has Administrator, add a field indicating the member
		// has all permissions and return:
		if (PermissionsBits.has(permissions, PermissionFlagsBits.Administrator)) {
			embed.addFields({
				name: t(LanguageKeys.Commands.Tools.WhoisMemberPermissions),
				value: t(LanguageKeys.Commands.Tools.WhoisMemberPermissionsAll)
			});
			return;
		}

		// Create an intersection between the permissions the member has and the
		// key permissions, if there are no permissions, return, else add a field
		// with the permissions:
		const intersection = PermissionsBits.intersection(permissions, this.KeyPermissions);
		if (intersection === 0n) return;

		embed.addFields({
			name: t(LanguageKeys.Commands.Tools.WhoisMemberPermissions),
			value: [...map(PermissionsBits.toKeys(intersection), (name) => t(`permissions:${name}`))].join(', ')
		});
	}

	private getBoostIcon(boostingSince: number | null): string {
		if (boostingSince === null || boostingSince <= 0) return '';
		return ` ${this.getBoostEmoji(Date.now() - boostingSince)}`;
	}

	private getBoostEmoji(duration: number): string {
		if (duration >= months(24)) return Emojis.BoostLevel9;
		if (duration >= months(18)) return Emojis.BoostLevel8;
		if (duration >= months(15)) return Emojis.BoostLevel7;
		if (duration >= months(12)) return Emojis.BoostLevel6;
		if (duration >= months(9)) return Emojis.BoostLevel5;
		if (duration >= months(6)) return Emojis.BoostLevel4;
		if (duration >= months(3)) return Emojis.BoostLevel3;
		if (duration >= months(2)) return Emojis.BoostLevel2;
		return Emojis.BoostLevel1;
	}
}

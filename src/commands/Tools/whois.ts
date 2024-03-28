import { SkyraEmbed } from '#lib/discord';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getSupportedUserLanguageT } from '#lib/i18n/translate';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionsBits } from '#utils/bits';
import { desc, map, maybeParseDate, months, seconds } from '#utils/common';
import { Colors, EmojiData, Emojis } from '#utils/constants';
import { getDisplayAvatar, getTag } from '#utils/util';
import { ActionRowBuilder, ButtonBuilder, TimestampStyles, time } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { applyLocalizedBuilder, applyNameLocalizedBuilder, type TFunction } from '@sapphire/plugin-i18next';
import { isNullishOrEmpty, isNullishOrZero } from '@sapphire/utilities';
import {
	ApplicationCommandType,
	ButtonStyle,
	ChatInputCommandInteraction,
	GuildMember,
	PermissionFlagsBits,
	UserContextMenuCommandInteraction,
	bold,
	chatInputApplicationCommandMention,
	inlineCode,
	roleMention,
	type APIInteractionDataResolvedGuildMember,
	type APIInteractionGuildMember,
	type Role,
	type Snowflake,
	type User
} from 'discord.js';

const sortRanks = (x: Role, y: Role) => desc(x.position, y.position);

const Root = LanguageKeys.Commands.Whois;

type IncomingGuildMember = GuildMember | RawIncomingGuildMember;
type RawIncomingGuildMember = APIInteractionGuildMember | APIInteractionDataResolvedGuildMember;

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['userinfo', 'uinfo', 'user'],
	description: Root.Description,
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

		return send(message, {
			...this.sharedRun(args.t, user, member),
			content: args.t(LanguageKeys.Commands.Shared.DeprecatedMessage, {
				command: chatInputApplicationCommandMention(this.name, this.getGlobalCommandId())
			})
		});
	}

	public override async chatInputRun(interaction: ChatInputCommandInteraction) {
		const user = interaction.options.getUser('user', true);
		const member = interaction.options.getMember('user');

		return interaction.reply({
			...this.sharedRun(getSupportedUserLanguageT(interaction), user, member),
			ephemeral: true
		});
	}

	public override async contextMenuRun(interaction: UserContextMenuCommandInteraction) {
		const user = interaction.targetUser;
		const member = interaction.targetMember;

		return interaction.reply({
			...this.sharedRun(getSupportedUserLanguageT(interaction), user, member),
			ephemeral: true
		});
	}

	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) =>
			applyLocalizedBuilder(builder, Root.Name, Root.Description) //
				.addUserOption((option) => applyLocalizedBuilder(option, Root.User).setRequired(true))
				.setDMPermission(false)
		);

		registry.registerContextMenuCommand((builder) =>
			applyNameLocalizedBuilder(builder, Root.ContextMenuName) //
				.setType(ApplicationCommandType.User)
				.setDMPermission(false)
		);
	}

	private sharedRun(t: TFunction, user: User, member: IncomingGuildMember | null) {
		const embed = member ? this.member(t, member, user) : this.user(t, user);
		return { embeds: [embed], components: [this.getComponentRow(t, user)] };
	}

	private user(t: TFunction, user: User) {
		return new SkyraEmbed()
			.setColor(Colors.White)
			.setThumbnail(getDisplayAvatar(user, { size: 256 }))
			.setDescription(this.getUserInformation(t, user));
	}

	private member(t: TFunction, member: IncomingGuildMember, user: User) {
		const isCached = member instanceof GuildMember;
		const displayColor = isCached ? member.displayColor || Colors.White : Colors.White;
		const embed = new SkyraEmbed()
			.setColor(displayColor)
			.setThumbnail(getDisplayAvatar(user, { size: 256 }))
			.setDescription(this.getMemberInformation(t, member, user));

		this.applyMemberRoles(t, isCached ? this.getGuildMemberRoles(member) : this.getRawMemberRoles(member), embed);
		this.applyMemberKeyPermissions(t, member, embed);
		return embed;
	}

	private getUserInformation(t: TFunction, user: User, extras = ''): string {
		const bot = user.bot ? ` ${Emojis.IntegrationIcon}` : '';
		const header = `${user.toString()} - ${bold(getTag(user))}${bot}${extras} (${inlineCode(user.id)})`;
		const description = t(Root.EmbedDescription, {
			id: user.id,
			createdAt: time(seconds.fromMilliseconds(user.createdTimestamp), TimestampStyles.RelativeTime)
		});
		return `${header}\n\n${description}`;
	}

	private getMemberInformation(t: TFunction, member: IncomingGuildMember, user: User): string {
		const isCached = member instanceof GuildMember;
		const premiumSince = isCached ? member.premiumSinceTimestamp : maybeParseDate(member.premium_since);
		const joinedAt = isCached ? member.joinedTimestamp : maybeParseDate(member.joined_at);

		const header = this.getUserInformation(t, user, this.getBoostIcon(premiumSince));
		const description = t(Root.EmbedMemberDescription, {
			joinedAt: time(seconds.fromMilliseconds(joinedAt!), TimestampStyles.RelativeTime)
		});
		return `${header}\n${description}`;
	}

	private applyMemberRoles(t: TFunction, roles: string[] | null, embed: SkyraEmbed) {
		if (isNullishOrEmpty(roles)) return;

		embed.splitFields(t(Root.RolesTitle, { count: roles.length }), roles.join(' '));
	}

	private getGuildMemberRoles(member: GuildMember) {
		const roles = member.roles.cache;
		// If the member has @everyone or no roles, return null:
		if (roles.size <= 1) return null;

		const sorted = roles.sorted(sortRanks);
		sorted.delete(member.guild.id);
		return sorted.map((role) => role.toString());
	}

	private getRawMemberRoles(member: RawIncomingGuildMember) {
		// We cannot sort the roles because we do not have the guild, so we just map them:
		return member.roles.map((id) => roleMention(id));
	}

	private applyMemberKeyPermissions(t: TFunction, member: IncomingGuildMember, embed: SkyraEmbed) {
		const bitfield = this.getMemberPermissions(member);

		// If the member has Administrator, add a field indicating the member
		// has all permissions and return:
		if (PermissionsBits.has(bitfield, PermissionFlagsBits.Administrator)) {
			embed.addFields({ name: t(Root.PermissionsTitle), value: t(Root.PermissionsAll) });
			return;
		}

		// Create an intersection between the permissions the member has and the
		// key permissions, if there are no permissions, return, else add a field
		// with the permissions:
		const intersection = PermissionsBits.intersection(bitfield, this.KeyPermissions);
		if (intersection === 0n) return;

		embed.addFields({
			name: t(Root.PermissionsTitle),
			value: [...map(PermissionsBits.toKeys(intersection), (name) => t(`permissions:${name}`))].join(', ')
		});
	}

	private getMemberPermissions(member: IncomingGuildMember): bigint {
		const { permissions } = member;
		return typeof permissions === 'string' ? BigInt(permissions) : permissions.bitfield;
	}

	private getBoostIcon(boostingSince: number | null): string {
		return isNullishOrZero(boostingSince) ? '' : ` ${this.getBoostEmoji(Date.now() - boostingSince)}`;
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

	private getComponentRow(t: TFunction, user: User) {
		return new ActionRowBuilder<ButtonBuilder>() //
			.addComponents(this.getAvatarButton(t, getDisplayAvatar(user, { size: 4096 })), this.getProfileLinkButton(t, user.id));
	}

	private getAvatarButton(t: TFunction, url: string) {
		return new ButtonBuilder() //
			.setStyle(ButtonStyle.Link)
			.setEmoji(EmojiData.MessageAttachmentIcon)
			.setLabel(t(Root.ButtonAvatar))
			.setURL(url);
	}

	private getProfileLinkButton(t: TFunction, id: Snowflake) {
		return new ButtonBuilder() //
			.setStyle(ButtonStyle.Link)
			.setEmoji(EmojiData.MembersIcon)
			.setLabel(t(Root.ButtonProfile))
			.setURL(`discord://-/users/${id}`);
	}
}

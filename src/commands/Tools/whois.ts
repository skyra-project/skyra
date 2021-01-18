import { SkyraEmbed } from '#lib/discord';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import type { GuildMessage } from '#lib/types';
import { Colors } from '#lib/types/Constants';
import { Emojis, Time } from '#utils/constants';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { GuildMember, Permissions, PermissionString, Role, User } from 'discord.js';
import type { TFunction } from 'i18next';

const sortRanks = (x: Role, y: Role) => Number(y.position > x.position) || Number(x.position === y.position) - 1;
const { FLAGS } = Permissions;

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['userinfo', 'uinfo'],
	cooldown: 15,
	description: LanguageKeys.Commands.Tools.WhoisDescription,
	extendedHelp: LanguageKeys.Commands.Tools.WhoisExtended,
	requiredPermissions: ['EMBED_LINKS'],
	runIn: ['text'],
	usage: '(user:username)'
})
@CreateResolvers([
	['username', (arg, possible, message) => (arg ? message.client.arguments.get('username')!.run(arg, possible, message) : message.author)]
])
export default class extends SkyraCommand {
	private readonly kAdministratorPermission = FLAGS.ADMINISTRATOR;
	private readonly kKeyPermissions: [PermissionString, number][] = [
		['BAN_MEMBERS', FLAGS.BAN_MEMBERS],
		['KICK_MEMBERS', FLAGS.KICK_MEMBERS],
		['MANAGE_CHANNELS', FLAGS.MANAGE_CHANNELS],
		['MANAGE_EMOJIS', FLAGS.MANAGE_EMOJIS],
		['MANAGE_GUILD', FLAGS.MANAGE_GUILD],
		['MANAGE_MESSAGES', FLAGS.MANAGE_MESSAGES],
		['MANAGE_NICKNAMES', FLAGS.MANAGE_NICKNAMES],
		['MANAGE_ROLES', FLAGS.MANAGE_ROLES],
		['MANAGE_WEBHOOKS', FLAGS.MANAGE_WEBHOOKS],
		['MENTION_EVERYONE', FLAGS.MENTION_EVERYONE]
	];

	public async run(message: GuildMessage, [user]: [User]) {
		const member = await message.guild.members.fetch(user.id).catch(() => null);
		const t = await message.fetchT();

		return message.send(member ? this.member(t, member) : this.user(t, user));
	}

	private user(t: TFunction, user: User) {
		const titles = t(LanguageKeys.Commands.Tools.WhoisUserTitles);
		const fields = t(LanguageKeys.Commands.Tools.WhoisUserFields, { user, createdTimestampOffset: Date.now() - user.createdTimestamp });

		return new SkyraEmbed()
			.setColor(Colors.White)
			.setThumbnail(user.displayAvatarURL({ size: 256, format: 'png', dynamic: true }))
			.setDescription(this.getUserInformation(user))
			.addField(titles.createdAt, fields.createdAt)
			.setFooter(fields.footer, this.client.user!.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setTimestamp();
	}

	private member(t: TFunction, member: GuildMember) {
		const titles = t(LanguageKeys.Commands.Tools.WhoisMemberTitles);
		const fields = t(LanguageKeys.Commands.Tools.WhoisMemberFields, {
			member,
			createdTimestampOffset: Date.now() - member.user.createdTimestamp,
			joinedTimestampOffset: Date.now() - member.joinedTimestamp!
		});

		const embed = new SkyraEmbed()
			.setColor(member.displayColor || Colors.White)
			.setThumbnail(member.user.displayAvatarURL({ size: 256, format: 'png', dynamic: true }))
			.setDescription(this.getUserInformation(member.user, this.getBoostIcon(member.premiumSinceTimestamp)))
			.addField(titles.joined, member.joinedTimestamp ? fields.joinedWithTimestamp : fields.joinedUnknown, true)
			.addField(titles.createdAt, fields.createdAt, true)
			.setFooter(fields.footer, this.client.user!.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setTimestamp();

		this.applyMemberRoles(t, member, embed);
		this.applyMemberKeyPermissions(t, member, embed);
		return embed;
	}

	private getUserInformation(user: User, extras = ''): string {
		const bot = user.bot ? ` ${Emojis.Bot}` : '';
		const avatar = `[Avatar ${Emojis.Frame}](${user.displayAvatarURL({ size: 4096, format: 'png', dynamic: true })})`;
		return `**${user.tag}**${bot} - ${user.toString()}${extras} - ${avatar}`;
	}

	private applyMemberRoles(t: TFunction, member: GuildMember, embed: SkyraEmbed) {
		if (member.roles.cache.size <= 1) return;

		const roles = member.roles.cache.sorted(sortRanks);
		roles.delete(member.guild.id);
		embed.splitFields(t(LanguageKeys.Commands.Tools.WhoisMemberRoles, { count: roles.size }), [...roles.values()].join(' '));
	}

	private applyMemberKeyPermissions(t: TFunction, member: GuildMember, embed: SkyraEmbed) {
		if (member.permissions.has(this.kAdministratorPermission)) {
			embed.addField(t(LanguageKeys.Commands.Tools.WhoisMemberPermissions), t(LanguageKeys.Commands.Tools.WhoisMemberPermissionsAll));
			return;
		}

		const permissions: string[] = [];
		for (const [name, bit] of this.kKeyPermissions) {
			if (member.permissions.has(bit)) permissions.push(t(`permissions:${name}`));
		}

		if (permissions.length > 0) {
			embed.addField(t(LanguageKeys.Commands.Tools.WhoisMemberPermissions), permissions.join(', '));
		}
	}

	private getBoostIcon(boostingSince: number | null): string {
		if (boostingSince === null || boostingSince <= 0) return '';
		return ` ${this.getBoostEmoji(Date.now() - boostingSince)}`;
	}

	private getBoostEmoji(duration: number): string {
		if (duration >= Time.Month * 24) return Emojis.BoostLevel9;
		if (duration >= Time.Month * 18) return Emojis.BoostLevel8;
		if (duration >= Time.Month * 15) return Emojis.BoostLevel7;
		if (duration >= Time.Month * 12) return Emojis.BoostLevel6;
		if (duration >= Time.Month * 9) return Emojis.BoostLevel5;
		if (duration >= Time.Month * 6) return Emojis.BoostLevel4;
		if (duration >= Time.Month * 3) return Emojis.BoostLevel3;
		if (duration >= Time.Month * 2) return Emojis.BoostLevel2;
		return Emojis.BoostLevel1;
	}
}

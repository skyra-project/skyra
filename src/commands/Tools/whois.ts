import { SkyraEmbed } from '#lib/discord';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { GuildMessage } from '#lib/types';
import { Colors } from '#lib/types/constants/Constants';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { Emojis, Time } from '#utils/constants';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { GuildMember, Permissions, PermissionString, Role, User } from 'discord.js';
import { Language } from 'klasa';

const sortRanks = (x: Role, y: Role) => Number(y.position > x.position) || Number(x.position === y.position) - 1;
const { FLAGS } = Permissions;

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['userinfo', 'uinfo'],
	cooldown: 15,
	description: (language) => language.get(LanguageKeys.Commands.Tools.WhoisDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Tools.WhoisExtended),
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
		const language = await message.fetchLanguage();

		return message.send(member ? this.member(language, member) : this.user(language, user));
	}

	private user(language: Language, user: User) {
		const titles = language.get(LanguageKeys.Commands.Tools.WhoisUserTitles);
		const fields = language.get(LanguageKeys.Commands.Tools.WhoisUserFields, { user });

		return new SkyraEmbed()
			.setColor(Colors.White)
			.setThumbnail(user.displayAvatarURL({ size: 256, format: 'png', dynamic: true }))
			.setDescription(this.getUserInformation(user))
			.addField(titles.createdAt, fields.createdAt)
			.setFooter(fields.footer, this.client.user!.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setTimestamp();
	}

	private member(language: Language, member: GuildMember) {
		const titles = language.get(LanguageKeys.Commands.Tools.WhoisMemberTitles);
		const fields = language.get(LanguageKeys.Commands.Tools.WhoisMemberFields, { member });

		const embed = new SkyraEmbed()
			.setColor(member.displayColor || Colors.White)
			.setThumbnail(member.user.displayAvatarURL({ size: 256, format: 'png', dynamic: true }))
			.setDescription(this.getUserInformation(member.user, this.getBoostIcon(member.premiumSinceTimestamp)))
			.addField(titles.joined, member.joinedTimestamp ? fields.joinedWithTimestamp : fields.joinedUnknown, true)
			.addField(titles.createdAt, fields.createdAt, true)
			.setFooter(fields.footer, this.client.user!.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setTimestamp();

		this.applyMemberRoles(language, member, embed);
		this.applyMemberKeyPermissions(language, member, embed);
		return embed;
	}

	private getUserInformation(user: User, extras = ''): string {
		const bot = user.bot ? ` ${Emojis.Bot}` : '';
		const avatar = `[Avatar ${Emojis.Frame}](${user.displayAvatarURL({ size: 4096, format: 'png', dynamic: true })})`;
		return `**${user.tag}**${bot} - ${user.toString()}${extras} - ${avatar}`;
	}

	private applyMemberRoles(language: Language, member: GuildMember, embed: SkyraEmbed) {
		if (member.roles.cache.size <= 1) return;

		const roles = member.roles.cache.sorted(sortRanks);
		roles.delete(member.guild.id);
		embed.splitFields(
			language.get(roles.size === 1 ? LanguageKeys.Commands.Tools.WhoisMemberRoles : LanguageKeys.Commands.Tools.WhoisMemberRolesPlural, {
				count: roles.size
			}),
			[...roles.values()].join(' ')
		);
	}

	private applyMemberKeyPermissions(language: Language, member: GuildMember, embed: SkyraEmbed) {
		if (member.permissions.has(this.kAdministratorPermission)) {
			embed.addField(
				language.get(LanguageKeys.Commands.Tools.WhoisMemberPermissions),
				language.get(LanguageKeys.Commands.Tools.WhoisMemberPermissionsAll)
			);
			return;
		}

		const permissions: string[] = [];
		for (const [name, bit] of this.kKeyPermissions) {
			if (member.permissions.has(bit)) permissions.push(language.PERMISSIONS[name]);
		}

		if (permissions.length > 0) {
			embed.addField(language.get(LanguageKeys.Commands.Tools.WhoisMemberPermissions), permissions.join(', '));
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

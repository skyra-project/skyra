import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { Colors } from '@lib/types/constants/Constants';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Emojis, Time } from '@utils/constants';
import { GuildMember, MessageEmbed, Permissions, PermissionString, Role, User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

const sortRanks = (x: Role, y: Role) => Number(y.position > x.position) || Number(x.position === y.position) - 1;
const { FLAGS } = Permissions;

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

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['userinfo', 'uinfo'],
			cooldown: 15,
			description: (language) => language.get(LanguageKeys.Commands.Tools.WhoisDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Tools.WhoisExtended),
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			usage: '(user:username)'
		});

		this.createCustomResolver('username', (arg, possible, message) =>
			arg ? this.client.arguments.get('username')!.run(arg, possible, message) : message.author
		);
	}

	public async run(message: KlasaMessage, [user]: [User]) {
		const member = await message.guild!.members.fetch(user.id).catch(() => null);

		return message.sendMessage(member ? this.member(message, member) : this.user(message, user));
	}

	private user(message: KlasaMessage, user: User) {
		const titles = message.language.get(LanguageKeys.Commands.Tools.WhoisUserTitles);
		const fields = message.language.get(LanguageKeys.Commands.Tools.WhoisUserFields, { user });

		return new MessageEmbed()
			.setColor(Colors.White)
			.setAuthor(user.tag, user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setURL(user.displayAvatarURL({ size: 4096, format: 'png', dynamic: true }))
			.setThumbnail(user.displayAvatarURL({ size: 256, format: 'png', dynamic: true }))
			.setDescription(user.toString())
			.addField(titles.createdAt, fields.createdAt)
			.setFooter(fields.footer, this.client.user!.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setTimestamp();
	}

	private member(message: KlasaMessage, member: GuildMember) {
		const titles = message.language.get(LanguageKeys.Commands.Tools.WhoisMemberTitles);
		const fields = message.language.get(LanguageKeys.Commands.Tools.WhoisMemberFields, { member });

		const embed = new MessageEmbed()
			.setColor(member.displayColor || Colors.White)
			.setAuthor(
				`${member.user.tag}${member.user.bot ? ` [BOT]` : ''}`,
				member.user.displayAvatarURL({ size: 128, format: 'png', dynamic: true })
			)
			.setURL(member.user.displayAvatarURL({ size: 4096, format: 'png', dynamic: true }))
			.setThumbnail(member.user.displayAvatarURL({ size: 256, format: 'png', dynamic: true }))
			.setDescription(`${member.toString()}${this.getBoostIcon(member.premiumSinceTimestamp)}`)
			.addField(titles.joined, member.joinedTimestamp ? fields.joinedWithTimestamp : fields.joinedUnknown)
			.addField(titles.createdAt, fields.createdAt, true)
			.setFooter(fields.footer, this.client.user!.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setTimestamp();

		this.applyMemberRoles(message, member, embed);
		this.applyMemberKeyPermissions(message, member, embed);
		return embed;
	}

	private applyMemberRoles(message: KlasaMessage, member: GuildMember, embed: MessageEmbed) {
		if (member.roles.cache.size <= 1) return;

		const roles = member.roles.cache.sorted(sortRanks);
		roles.delete(member.guild.id);
		embed.splitFields(
			message.language.get(
				roles.size === 1 ? LanguageKeys.Commands.Tools.WhoisMemberRoles : LanguageKeys.Commands.Tools.WhoisMemberRolesPlural,
				{ count: roles.size }
			),
			[...roles.values()].join(' ')
		);
	}

	private applyMemberKeyPermissions(message: KlasaMessage, member: GuildMember, embed: MessageEmbed) {
		if (member.permissions.has(this.kAdministratorPermission)) {
			embed.addField(
				message.language.get(LanguageKeys.Commands.Tools.WhoisMemberPermissions),
				message.language.get(LanguageKeys.Commands.Tools.WhoisMemberPermissionsAll)
			);
			return;
		}

		const permissions: string[] = [];
		for (const [name, bit] of this.kKeyPermissions) {
			if (member.permissions.has(bit)) permissions.push(message.language.PERMISSIONS[name]);
		}

		if (permissions.length > 0) {
			embed.addField(message.language.get(LanguageKeys.Commands.Tools.WhoisMemberPermissions), permissions.join(', '));
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

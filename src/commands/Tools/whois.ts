import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { BrandingColors } from '@utils/constants';
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
			.setColor(BrandingColors.Secondary)
			.setAuthor(user.tag, user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setDescription(user.toString())
			.addField(titles.createdAt, fields.createdAt)
			.setThumbnail(user.displayAvatarURL({ size: 256, format: 'png', dynamic: true }))
			.setFooter(fields.footer, this.client.user!.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setTimestamp();
	}

	private member(message: KlasaMessage, member: GuildMember) {
		const titles = message.language.get(LanguageKeys.Commands.Tools.WhoisMemberTitles);
		const fields = message.language.get(LanguageKeys.Commands.Tools.WhoisMemberFields, { member });

		const embed = new MessageEmbed()
			.setColor(member.displayColor || BrandingColors.Secondary)
			.addField(titles.joined, member.joinedTimestamp ? fields.joinedWithTimestamp : fields.joinedUnknown)
			.addField(titles.createdAt, fields.createdAt)
			.setAuthor(member.user.tag, member.user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setDescription(member.toString())
			.setThumbnail(member.user.displayAvatarURL({ size: 256, format: 'png', dynamic: true }))
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
}

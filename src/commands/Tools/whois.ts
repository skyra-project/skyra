import { SkyraCommand } from '@lib/structures/SkyraCommand';
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
			description: (language) => language.get('COMMAND_WHOIS_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WHOIS_EXTENDED'),
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
		const TITLES = message.language.get('COMMAND_WHOIS_USER_TITLES');
		const FIELDS = message.language.get('COMMAND_WHOIS_USER_FIELDS', user);

		return new MessageEmbed()
			.setColor(BrandingColors.Secondary)
			.setAuthor(user.tag, user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setDescription(user.toString())
			.addField(TITLES.CREATED_AT, FIELDS.CREATED_AT)
			.setThumbnail(user.displayAvatarURL({ size: 256, format: 'png', dynamic: true }))
			.setFooter(FIELDS.FOOTER, this.client.user!.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setTimestamp();
	}

	private member(message: KlasaMessage, member: GuildMember) {
		const TITLES = message.language.get('COMMAND_WHOIS_MEMBER_TITLES');
		const FIELDS = message.language.get('COMMAND_WHOIS_MEMBER_FIELDS', member);

		const embed = new MessageEmbed()
			.setColor(member.displayColor || BrandingColors.Secondary)
			.addField(TITLES.JOINED, FIELDS.JOINED)
			.addField(TITLES.CREATED_AT, FIELDS.CREATED_AT)
			.setAuthor(member.user.tag, member.user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setDescription(member.toString())
			.setThumbnail(member.user.displayAvatarURL({ size: 256, format: 'png', dynamic: true }))
			.setFooter(FIELDS.FOOTER, this.client.user!.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setTimestamp();

		this.applyMemberRoles(message, member, embed);
		this.applyMemberKeyPermissions(message, member, embed);
		return embed;
	}

	private applyMemberRoles(message: KlasaMessage, member: GuildMember, embed: MessageEmbed) {
		if (member.roles.size <= 1) return;

		const roles = member.roles.sorted(sortRanks);
		roles.delete(member.guild.id);
		embed.splitFields(message.language.get('COMMAND_WHOIS_MEMBER_ROLES', roles.size), [...roles.values()].join(' '));
	}

	private applyMemberKeyPermissions(message: KlasaMessage, member: GuildMember, embed: MessageEmbed) {
		if (member.permissions.has(this.kAdministratorPermission)) {
			embed.addField(message.language.get('COMMAND_WHOIS_MEMBER_PERMISSIONS'), message.language.get('COMMAND_WHOIS_MEMBER_PERMISSIONS_ALL'));
			return;
		}

		const permissions: string[] = [];
		for (const [name, bit] of this.kKeyPermissions) {
			if (member.permissions.has(bit)) permissions.push(message.language.PERMISSIONS[name]);
		}

		if (permissions.length > 0) {
			embed.addField(message.language.get('COMMAND_WHOIS_MEMBER_PERMISSIONS'), permissions.join(', '));
		}
	}
}

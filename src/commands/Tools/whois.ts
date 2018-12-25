import { Command, MessageEmbed } from '../../index';

const sortRanks = (x, y) => +(y.position > x.position) || +(x.position === y.position) - 1;

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['userinfo'],
			requiredPermissions: ['EMBED_LINKS'],
			cooldown: 15,
			description: (language) => language.get('COMMAND_WHOIS_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WHOIS_EXTENDED'),
			runIn: ['text'],
			usage: '(user:username)'
		});

		this.createCustomResolver('username', (arg, possible, message) =>
			arg ? this.client.arguments.get('username').run(arg, possible, message) : message.author);
	}

	public async run(msg, [user = msg.author]) {
		const member = await msg.guild.members.fetch(user.id).catch(() => null);

		const embed = new MessageEmbed();
		if (member) this.member(member, embed, msg.language);
		else this.user(user, embed, msg.language);

		return msg.sendMessage({ embed });
	}

	public member(member, embed, i18n) {
		embed
			.setColor(member.displayColor || 0xdfdfdf)
			.setTitle(`${member.user.bot ? '🤖 ' : ''}${member.user.tag}`)
			.setURL(member.user.displayAvatarURL({ size: 1024 }))
			.setDescription(i18n.get('COMMAND_WHOIS_MEMBER', member))
			.setThumbnail(member.user.displayAvatarURL({ size: 256 }))
			.setFooter(`${this.client.user.username} ${this.client.version} | ${member.user.id}`, this.client.user.displayAvatarURL({ size: 128 }))
			.setTimestamp();

		if (member.roles.size > 1) {
			const roles = member.roles.sort(sortRanks);
			roles.delete(member.guild.defaultRole.id);
			embed.addField(i18n.get('COMMAND_WHOIS_MEMBER_ROLES'), [...roles.values()].map((role) => role.name).join(', '));
		}

		return embed;
	}

	public user(user, embed, i18n) {
		return embed
			.setColor(0xdfdfdf)
			.setTitle(`${user.bot ? '🤖 ' : ''}${user.tag}`)
			.setURL(user.displayAvatarURL({ size: 1024 }))
			.setDescription(i18n.get('COMMAND_WHOIS_USER', user))
			.setThumbnail(user.displayAvatarURL({ size: 256 }))
			.setFooter(`${this.client.user.username} ${this.client.version} | ES | ${user.id}`, this.client.user.displayAvatarURL({ size: 128 }))
			.setTimestamp();
	}

}

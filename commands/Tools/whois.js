const { Command } = require('../../index');
const { MessageEmbed } = require('discord.js');

const sortRanks = (x, y) => +(x.position > y.position) || +(x.position === y.position) - 1;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guildOnly: true,
			aliases: ['userinfo'],
			botPerms: ['EMBED_LINKS'],
			mode: 1,
			cooldown: 15,

			usage: '[query:advuser]',
			description: 'Who are you?'
		});
	}

	async run(msg, [user = msg.author], settings, i18n) {
		const member = await msg.guild.members.fetch(user)
			.catch(() => null);

		const embed = new MessageEmbed();
		if (member)
			this.member(member, embed, i18n);
		else
			this.user(user, embed, i18n);

		return msg.send({ embed });
	}

	member(member, embed, i18n) {
		embed
			.setColor(member.highestRole.color || 0xdfdfdf)
			.setTitle(`${member.user.bot ? '🤖' : ''}${member.user.tag}`)
			.setURL(member.user.displayAvatarURL({ size: 1024 }))
			.setDescription(i18n.get('COMMAND_WHOIS_MEMBER', member))
			.setThumbnail(member.user.displayAvatarURL({ size: 256 }))
			.setFooter(`${this.client.user.username} ${this.client.version} | ${member.user.id}`, this.client.user.displayAvatarURL({ size: 128 }))
			.setTimestamp();
		if (member.roles.size > 1)
			embed.addField(i18n.get('COMMAND_WHOIS_MEMBER_ROLES'), member.roles
				.array()
				.slice(1)
				.sort(sortRanks)
				.map(role => role.name)
				.join(', '));

		return embed;
	}

	user(user, embed, i18n) {
		return embed
			.setColor(0xdfdfdf)
			.setTitle(`${user.bot ? '🤖' : ''}${user.tag}`)
			.setURL(user.displayAvatarURL({ size: 1024 }))
			.setDescription(i18n.get('COMMAND_WHOIS_USER', user))
			.setThumbnail(user.displayAvatarURL({ size: 256 }))
			.setFooter(`${this.client.user.username} ${this.client.version} | ES | ${user.id}`, this.client.user.displayAvatarURL({ size: 128 }))
			.setTimestamp();
	}

};

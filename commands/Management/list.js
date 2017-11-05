const { structures: { Command } } = require('../../index');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guildOnly: true,
			permLevel: 2,
			botPerms: ['EMBED_LINKS'],
			mode: 2,
			cooldown: 5,

			usage: '<channels|roles|members|warnings> [input:string] [...]',
			usageDelim: ' ',
			description: 'Check all channels from this server.'
		});
	}

	async run(msg, [type, ...input], settings, i18n) {
		input = input.length ? input.join(' ') : null;
		const embed = new MessageEmbed()
			.setColor(msg.member.highestRole.color || 0xdfdfdf)
			.setFooter(this.client.user.username, this.client.user.displayAvatarURL({ size: 128 }))
			.setTimestamp();

		const reply = await this[type](msg, embed, input, settings, i18n);

		return msg.send(reply instanceof MessageEmbed ? { embed: reply } : reply);
	}

	async channels(msg, embed, input, settings, i18n) {
		return embed
			.setTitle(i18n.get('COMMAND_LIST_CHANNELS', msg.guild.name, msg.guild.id))
			.splitFields(msg.guild.channels
				.sort((x, y) => +(x.position > y.position) || +(x.position === y.position) - 1)
				.map(channel => `❯ **${channel.name}** **\`${channel.toString()}\`**`)
				.join('\n')
			);
	}

	async roles(msg, embed, input, settings, i18n) {
		return embed
			.setTitle(i18n.get('COMMAND_LIST_ROLES', msg.guild.name, msg.guild.id))
			.splitFields(Array.from(msg.guild.roles.values())
				.sort((x, y) => +(x.position > y.position) || +(x.position === y.position) - 1)
				.slice(1)
				.reverse()
				.map(role => `❯ **\`${String(role.members.size).padStart(3, '_')}\`** ${role.name} (${role.id})`)
				.join('\n')
			);
	}

	async members(msg, embed, input, settings, i18n) {
		const role = await this.client.handler.search.role(input, msg);
		if (!role) throw i18n.get('REQUIRE_ROLE');
		if (role.members.size === 0) throw i18n.get('COMMAND_LIST_ROLE_EMPTY');

		return embed
			.setTitle(i18n.get('COMMAND_LIST_MEMBERS', role.name, role.id))
			.splitFields(role.members
				.map(member => `\`${member.id}\` ❯ ${member.user.tag}`)
				.join('\n')
			);
	}

	async warnings(msg, embed, input, settings, i18n) {
		const cases = await settings.moderation.getCases().then(cs => cs.filter(rl => rl.type === 'warn'));
		if (!input)
			return embed
				.setTitle(i18n.get('COMMAND_LIST_STRIKES', false))
				.splitFields(!cases.length
					? i18n.get('COMMAND_LIST_STRIKES_EMPTY')
					: i18n.get('COMMAND_LIST_STRIKES_ALL', cases.length, cases.map(rl => rl.case).join('`, `'))
				);

		const user = await this.client.handler.search.user(input, msg);

		if (user === null) throw i18n.get('REQUIRE_USER');
		const thisStrikes = cases.filter(ncase => ncase.user === user.id);

		const output = [];

		if (thisStrikes.length === 0) output.push(i18n.get('COMMAND_LIST_STRIKES_EMPTY_FOR', user.tag));
		else {
			output.push(`${i18n.get('COMMAND_LIST_STRIKES_ENUM', thisStrikes.length)}:\n`);

			for (const ncase of thisStrikes) {
				const moderator = await this.client.users.fetch(ncase.moderator);
				output.push(i18n.get('COMMAND_LIST_STRIKES_CASE', ncase.case, moderator.tag, ncase.reason || i18n.get('MODLOG_PENDING_REASON', settings.master.prefix, ncase.case)));
			}
		}

		return embed
			.setTitle(i18n.get('COMMAND_LIST_STRIKES', user.tag))
			.setDescription(output.join('\n'));
	}

};

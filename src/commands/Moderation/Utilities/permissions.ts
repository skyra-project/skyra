const { Command, MessageEmbed, Permissions: { FLAGS } } = require('../../../index');
const PERMISSION_FLAGS = Object.keys(FLAGS);

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			requiredPermissions: ['EMBED_LINKS'],
			bucket: 2,
			cooldown: 10,
			description: 'Check the permission for a member, or yours.',
			permissionLevel: 6,
			runIn: ['text'],
			usage: '[member:username]'
		});
	}

	async run(msg, [user = msg.author]) {
		if (!user) throw msg.language.get('REQUIRE_USER');
		const member = await msg.guild.members.fetch(user.id).catch(() => { throw msg.language.get('USER_NOT_IN_GUILD'); });

		const { permissions } = member;
		const list = ['\u200B'];
		if (permissions.has(FLAGS.ADMINISTRATOR)) {
			list.push(msg.language.get('COMMAND_PERMISSIONS_ALL'));
		} else {
			for (let i = 0; i < PERMISSION_FLAGS.length; i++)
				list.push(`${permissions.has(PERMISSION_FLAGS[i]) ? '🔹' : '🔸'} ${msg.language.PERMISSIONS[PERMISSION_FLAGS[i]] || PERMISSION_FLAGS[i]}`);
		}

		const embed = new MessageEmbed()
			.setColor(msg.member.displayColor || 0xdfdfdf)
			.setTitle(msg.language.get('COMMAND_PERMISSIONS', user.tag, user.id))
			.setDescription(list.join('\n'));

		return msg.sendMessage({ embed });
	}

};

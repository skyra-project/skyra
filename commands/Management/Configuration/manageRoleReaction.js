const { Command } = require('../../../index');

const REG_REAC = /^<(:[^:]+:\d{17,19})>$/;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			bucket: 2,
			cooldown: 10,
			description: (msg) => msg.language.get('COMMAND_MANAGEROLEREACTION_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_MANAGEROLEREACTION_EXTENDED'),
			permLevel: 6,
			runIn: ['text'],
			usage: '<add|remove|list> (reaction:reaction) (role:role)'
		});

		this.createCustomResolver('reaction', async (arg, possible, msg, [action = 'list']) => {
			if (action === 'list') return undefined;
			if (!arg) throw msg.language.get('COMMAND_SETROLEREACTION');

			try {
				if (REG_REAC.test(arg)) arg = REG_REAC.exec(arg)[1];
				await msg.react(arg);
				return arg;
			} catch (_) {
				throw msg.language.get('COMMAND_TRIGGERS_INVALIDREACTION');
			}
		});
	}

	async run(msg, [channel]) {
		if (channel === 'here') channel = msg.channel;
		else if (channel.type !== 'text') throw msg.language.get('CONFIGURATION_TEXTCHANNEL_REQUIRED');
		if (msg.guild.configs.channels.roles === channel.id) throw msg.language.get('CONFIGURATION_EQUALS');
		await msg.guild.configs.update('channels.roles', channel);
		return msg.sendMessage(msg.language.get('COMMAND_SETROLECHANNEL_SET', channel));
	}

};

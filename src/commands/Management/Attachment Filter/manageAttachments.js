const { Command, Adder } = require('../../../index');

const TYPES = {
	maximum: {
		key: 'selfmod.attachmentMaximum',
		language: 'COMMAND_MANAGEATTACHMENTS_MAXIMUM'
	},
	expire: {
		key: 'selfmod.attachmentDuration',
		language: 'COMMAND_MANAGEATTACHMENTS_EXPIRE'
	},
	duration: {
		key: 'selfmod.attachmentPunishmentDuration',
		language: 'COMMAND_MANAGEATTACHMENTS_DURATION'
	},
	action: {
		key: 'selfmod.attachmentAction',
		language: 'COMMAND_MANAGEATTACHMENTS_ACTION'
	},
	logs: {
		key: 'selfmod.attachmentAction',
		language: 'COMMAND_MANAGEATTACHMENTS_LOGS'
	},
	enable: {
		key: 'selfmod.attachment',
		language: 'COMMAND_MANAGEATTACHMENTS_ENABLED'
	},
	disable: {
		key: 'selfmod.attachment',
		language: 'COMMAND_MANAGEATTACHMENTS_ENABLED'
	}
};

const ACTIONS = ['warn', 'kick', 'mute', 'softban', 'ban'];

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			cooldown: 5,
			description: (language) => language.get('COMMAND_MANAGEATTACHMENTS_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_MANAGEATTACHMENTS_EXTENDED'),
			permissionLevel: 5,
			runIn: ['text'],
			usage: '<maximum|expire|duration|action|logs|enable|disable> (value:value)',
			usageDelim: ' '
		});

		this.createCustomResolver('value', async (arg, possible, message, [type]) => {
			if (type === 'enable') return true;
			if (type === 'disable') return false;
			if (!arg) throw message.language.get('COMMAND_MANAGEATTACHMENTS_REQUIRED_VALUE');

			if (type === 'maximum') {
				const maximum = await this.client.arguments.get('integer').run(arg, possible, message);
				if (maximum >= 0 && maximum <= 60) return maximum;
				throw message.language.get('RESOLVER_MINMAX_BOTH', possible.name, 0, 60, '');
			}

			if (type === 'action') {
				const action = arg.toLowerCase();
				const index = ACTIONS.indexOf(action);
				// eslint-disable-next-line no-bitwise
				if (index !== -1) return (message.guild.settings.selfmod.attachmentAction & 0b1000) + index;
				throw message.language.get('COMMAND_MANAGEATTACHMENTS_INVALID_ACTION');
			}

			if (type === 'logs') {
				const value = await this.client.arguments.get('boolean').run(arg, possible, message);
				return value
					// eslint-disable-next-line no-bitwise
					? (message.guild.settings.selfmod.attachmentAction & 0b0111) | 0b1000
					// eslint-disable-next-line no-bitwise
					: (message.guild.settings.selfmod.attachmentAction & 0b0111) & 0b0111;
			}

			const duration = Math.round(((await this.client.arguments.get('duration').run(arg, possible, message)).getTime() - Date.now()) / 1000) * 1000;
			if (duration < 5000 || duration > 120000) throw message.language.get('RESOLVER_MINMAX_BOTH', possible.name, 0, 60, message.language.get('RESOLVER_DATE_SUFFIX'));
			return duration;
		});
	}

	async run(message, [type, value]) {
		const { key, language } = TYPES[type];
		await message.guild.settings.update(key, value);

		// Update the adder
		switch (type) {
			case 'disable': message.guild.security.adder = null; break;
			case 'enable':
			case 'maximum':
			case 'duration': {
				const { selfmod } = message.guild.settings;
				if (!message.guild.security.adder) {
					message.guild.security.adder = new Adder(selfmod.attachmentMaximum, selfmod.attachmentDuration);
				} else {
					message.guild.security.adder.maximum = selfmod.attachmentMaximum;
					message.guild.security.adder.duration = selfmod.attachmentDuration;
				}
				break;
			}
		}
		return message.sendLocale(language, [value]);
	}

};

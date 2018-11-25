import { Command, Adder, Duration : { year }; } from; '../../../index';

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

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			cooldown: 5,
			description: (language) => language.get('COMMAND_MANAGEATTACHMENTS_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_MANAGEATTACHMENTS_EXTENDED'),
			permissionLevel: 5,
			runIn: ['text'],
			usage: '<maximum|expire|duration|action|logs|enable|disable> (value:value)',
			usageDelim: ' '
		});

		this.createCustomResolver('value', async(arg, possible, message, [type]) => {
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
				if (index !== -1) return (message.guild.settings.selfmod.attachmentAction & 0b1000) + index;
				throw message.language.get('COMMAND_MANAGEATTACHMENTS_INVALID_ACTION');
			}

			if (type === 'logs') {
				const value = await this.client.arguments.get('boolean').run(arg, possible, message);
				return value
					? (message.guild.settings.selfmod.attachmentAction & 0b0111) | 0b1000
					: (message.guild.settings.selfmod.attachmentAction & 0b0111) & 0b0111;
			}

			const [min, max] = type === 'expire' ? [5000, 120000] : [60000, year];
			const duration = Math.round(((await this.client.arguments.get('duration').run(arg, possible, message)).getTime() - Date.now()) / 1000) * 1000;
			if (duration < min || duration > max) throw message.language.get('RESOLVER_MINMAX_BOTH', possible.name, min / 1000, max / 1000, message.language.get('RESOLVER_DATE_SUFFIX'));
			return duration;
		});
	}

	public async run(message, [type, value]) {
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
			}
		}
		return message.sendLocale(language, [value]);
	}

}

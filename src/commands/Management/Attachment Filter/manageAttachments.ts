import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { GuildSettings } from '../../../lib/types/namespaces/GuildSettings';
import { Adder } from '../../../lib/util/Adder';
import { TIME } from '../../../lib/util/constants';

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
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
				if (index !== -1) return (message.guild.settings.get(GuildSettings.Selfmod.AttachmentAction) as GuildSettings.Selfmod.AttachmentAction & 0b1000) + index;
				throw message.language.get('COMMAND_MANAGEATTACHMENTS_INVALID_ACTION');
			}

			if (type === 'logs') {
				const value = await this.client.arguments.get('boolean').run(arg, possible, message);
				return value
					? (message.guild.settings.get(GuildSettings.Selfmod.AttachmentAction) as GuildSettings.Selfmod.AttachmentAction & 0b0111) | 0b1000
					: (message.guild.settings.get(GuildSettings.Selfmod.AttachmentAction) as GuildSettings.Selfmod.AttachmentAction & 0b0111) & 0b0111;
			}

			const [min, max] = type === 'expire' ? [5000, 120000] : [60000, TIME.YEAR];
			const duration = Math.round(((await this.client.arguments.get('duration').run(arg, possible, message)).getTime() - Date.now()) / 1000) * 1000;
			if (duration < min || duration > max) throw message.language.get('RESOLVER_MINMAX_BOTH', possible.name, min / 1000, max / 1000, message.language.get('RESOLVER_DATE_SUFFIX'));
			return duration;
		});
	}

	public async run(message: KlasaMessage, [type, value]: [string, number]) {
		const { key, language } = TYPES[type];
		await message.guild.settings.update(key, value);

		// Update the adder
		switch (type) {
			case 'disable': message.guild.security.adder = null; break;
			case 'enable':
			case 'maximum':
			case 'duration': {
				const attachmentMaximum = message.guild.settings.get(GuildSettings.Selfmod.AttachmentMaximum) as GuildSettings.Selfmod.AttachmentMaximum;
				const attachmentDuration = message.guild.settings.get(GuildSettings.Selfmod.AttachmentDuration) as GuildSettings.Selfmod.AttachmentDuration;
				if (!message.guild.security.adder) {
					message.guild.security.adder = new Adder(attachmentMaximum, attachmentDuration);
				} else {
					message.guild.security.adder.maximum = attachmentMaximum;
					message.guild.security.adder.duration = attachmentDuration;
				}
			}
		}
		return message.sendLocale(language, [value]);
	}

}

const TYPES = {
	action: {
		key: 'selfmod.attachmentAction',
		language: 'COMMAND_MANAGEATTACHMENTS_ACTION'
	},
	disable: {
		key: 'selfmod.attachment',
		language: 'COMMAND_MANAGEATTACHMENTS_ENABLED'
	},
	duration: {
		key: 'selfmod.attachmentPunishmentDuration',
		language: 'COMMAND_MANAGEATTACHMENTS_DURATION'
	},
	enable: {
		key: 'selfmod.attachment',
		language: 'COMMAND_MANAGEATTACHMENTS_ENABLED'
	},
	expire: {
		key: 'selfmod.attachmentDuration',
		language: 'COMMAND_MANAGEATTACHMENTS_EXPIRE'
	},
	logs: {
		key: 'selfmod.attachmentAction',
		language: 'COMMAND_MANAGEATTACHMENTS_LOGS'
	},
	maximum: {
		key: 'selfmod.attachmentMaximum',
		language: 'COMMAND_MANAGEATTACHMENTS_MAXIMUM'
	}
};

const ACTIONS = ['warn', 'kick', 'mute', 'softban', 'ban'];

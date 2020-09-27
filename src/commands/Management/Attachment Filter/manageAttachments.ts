import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Adder } from '@utils/Adder';
import { Time } from '@utils/constants';
import { CommandStore, KlasaMessage } from 'klasa';

const TYPES = {
	action: {
		key: GuildSettings.Selfmod.AttachmentAction,
		language: 'commandManageAttachmentsAction'
	},
	disable: {
		key: GuildSettings.Selfmod.Attachment,
		language: 'commandManageAttachmentsDisabled'
	},
	duration: {
		key: GuildSettings.Selfmod.AttachmentPunishmentDuration,
		language: 'commandManageAttachmentsDuration'
	},
	enable: {
		key: GuildSettings.Selfmod.Attachment,
		language: 'commandManageAttachmentsEnabled'
	},
	expire: {
		key: GuildSettings.Selfmod.AttachmentDuration,
		language: 'commandManageAttachmentsExpire'
	},
	logs: {
		key: GuildSettings.Selfmod.AttachmentAction,
		language: 'commandManageAttachmentsLogs'
	},
	maximum: {
		key: GuildSettings.Selfmod.AttachmentMaximum,
		language: 'commandManageAttachmentsMaximum'
	}
} as const;

const ACTIONS = ['warn', 'kick', 'mute', 'softban', 'ban'];

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 5,
			description: (language) => language.get(LanguageKeys.Commands.Management.ManageAttachmentsDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.ManageAttachmentsExtended),
			permissionLevel: PermissionLevels.Administrator,
			runIn: ['text'],
			usage: '<maximum|expire|duration|action|logs|enable|disable> (value:value)',
			usageDelim: ' '
		});

		this.createCustomResolver('value', async (arg, possible, message, [type]) => {
			if (type === 'enable') return true;
			if (type === 'disable') return false;
			if (!arg) throw message.language.get(LanguageKeys.Commands.Management.ManageAttachmentsRequiredValue);

			if (type === 'maximum') {
				const maximum = await this.client.arguments.get('integer')!.run(arg, possible, message);
				if (maximum >= 0 && maximum <= 60) return maximum;
				throw message.language.get(LanguageKeys.Resolvers.MinmaxBothInclusive, { name: possible.name, min: 0, max: 60 });
			}

			if (type === 'action') {
				const action = arg.toLowerCase();
				const index = ACTIONS.indexOf(action);
				if (index !== -1) return (message.guild!.settings.get(GuildSettings.Selfmod.AttachmentAction) & 0b1000) + index;
				throw message.language.get(LanguageKeys.Commands.Management.ManageAttachmentsInvalidAction);
			}

			if (type === 'logs') {
				const value = await this.client.arguments.get('boolean')!.run(arg, possible, message);
				return value
					? (message.guild!.settings.get(GuildSettings.Selfmod.AttachmentAction) & 0b0111) | 0b1000
					: message.guild!.settings.get(GuildSettings.Selfmod.AttachmentAction) & 0b0111 & 0b0111;
			}

			const [min, max] = type === 'expire' ? [5000, 120000] : [60000, Time.Year];
			const duration =
				Math.round(((await this.client.arguments.get('duration')!.run(arg, possible, message)).getTime() - Date.now()) / 1000) * 1000;
			if (duration < min || duration > max)
				throw message.language.get(LanguageKeys.Resolvers.MinmaxBothInclusive, {
					name: possible.name,
					min: min / 1000,
					max: max / 1000
				});
			return duration;
		});
	}

	public async run(message: KlasaMessage, [type, value]: ['action' | 'enable' | 'disable' | 'maximum' | 'duration' | 'logs' | 'expire', number]) {
		const { key, language } = TYPES[type];
		await message.guild!.settings.update(key, value, {
			extraContext: { author: message.author.id }
		});

		// Update the adder
		switch (type) {
			case 'disable':
				message.guild!.security.adders.attachments = null;
				break;
			case 'enable':
			case 'maximum':
			case 'duration': {
				const attachmentMaximum = message.guild!.settings.get(GuildSettings.Selfmod.AttachmentMaximum);
				const attachmentDuration = message.guild!.settings.get(GuildSettings.Selfmod.AttachmentDuration);
				if (message.guild!.security.adders.attachments) {
					message.guild!.security.adders.attachments.maximum = attachmentMaximum;
					message.guild!.security.adders.attachments.duration = attachmentDuration;
				} else {
					message.guild!.security.adders.attachments = new Adder(attachmentMaximum, attachmentDuration);
				}
			}
			case 'action':
			case 'logs':
			case 'expire':
				break;
		}

		return this.sendReply(message, language, value);
	}

	private sendReply(message: KlasaMessage, languageKey: typeof TYPES[keyof typeof TYPES]['language'], value: any) {
		switch (languageKey) {
			case 'commandManageAttachmentsAction':
			case 'commandManageAttachmentsLogs':
			case 'commandManageAttachmentsEnabled':
			case 'commandManageAttachmentsDisabled':
				return message.language.get(languageKey);
			default:
				return message.language.get(languageKey, { value });
		}
	}
}

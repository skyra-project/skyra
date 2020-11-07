import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { GuildMessage } from '@lib/types';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { Adder } from '@utils/Adder';
import { Time } from '@utils/constants';
import { CommandOptions, Language } from 'klasa';

const TYPES = {
	action: {
		key: GuildSettings.Selfmod.Attachments.Action,
		languageKey: 'commandManageAttachmentsAction'
	},
	disable: {
		key: GuildSettings.Selfmod.Attachments.Enabled,
		languageKey: 'commandManageAttachmentsDisabled'
	},
	duration: {
		key: GuildSettings.Selfmod.Attachments.PunishmentDuration,
		languageKey: 'commandManageAttachmentsDuration'
	},
	enable: {
		key: GuildSettings.Selfmod.Attachments.Enabled,
		languageKey: 'commandManageAttachmentsEnabled'
	},
	expire: {
		key: GuildSettings.Selfmod.Attachments.Duration,
		languageKey: 'commandManageAttachmentsExpire'
	},
	logs: {
		key: GuildSettings.Selfmod.Attachments.Action,
		languageKey: 'commandManageAttachmentsLogs'
	},
	maximum: {
		key: GuildSettings.Selfmod.Attachments.Maximum,
		languageKey: 'commandManageAttachmentsMaximum'
	}
} as const;

const ACTIONS = ['warn', 'kick', 'mute', 'softban', 'ban'];

@ApplyOptions<CommandOptions>({
	cooldown: 5,
	description: (language) => language.get(LanguageKeys.Commands.Management.ManageAttachmentsDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.ManageAttachmentsExtended),
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['text'],
	usage: '<maximum|expire|duration|action|logs|enable|disable> (value:value)',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'value',
		async (arg, possible, message, [type]) => {
			if (type === 'enable') return true;
			if (type === 'disable') return false;
			if (!arg) throw await message.fetchLocale(LanguageKeys.Commands.Management.ManageAttachmentsRequiredValue);

			if (type === 'maximum') {
				const maximum = await message.client.arguments.get('integer')!.run(arg, possible, message);
				if (maximum >= 0 && maximum <= 60) return maximum;
				throw await message.fetchLocale(LanguageKeys.Resolvers.MinmaxBothInclusive, { name: possible.name, min: 0, max: 60 });
			}

			if (type === 'action') {
				const action = arg.toLowerCase();
				const index = ACTIONS.indexOf(action);
				if (index === -1) throw await message.fetchLocale(LanguageKeys.Commands.Management.ManageAttachmentsInvalidAction);

				return message.guild!.readSettings((settings) => (settings[GuildSettings.Selfmod.Attachments.Action] & 0b1000) + index);
			}

			if (type === 'logs') {
				const value = await message.client.arguments.get('boolean')!.run(arg, possible, message);
				return message.guild!.readSettings((settings) =>
					value
						? (settings[GuildSettings.Selfmod.Attachments.Action] & 0b0111) | 0b1000
						: settings[GuildSettings.Selfmod.Attachments.Action] & 0b0111 & 0b0111
				);
			}

			const [min, max] = type === 'expire' ? [5000, 120000] : [60000, Time.Year];
			const duration =
				Math.round(((await message.client.arguments.get('duration')!.run(arg, possible, message)).getTime() - Date.now()) / 1000) * 1000;
			if (duration >= min && duration <= max) return duration;

			throw await message.fetchLocale(LanguageKeys.Resolvers.MinmaxBothInclusive, {
				name: possible.name,
				min: min / 1000,
				max: max / 1000
			});
		}
	]
])
export default class extends SkyraCommand {
	public async run(message: GuildMessage, [type, value]: ['action' | 'enable' | 'disable' | 'maximum' | 'duration' | 'logs' | 'expire', number]) {
		const { key, languageKey } = TYPES[type];

		const [attachmentMaximum, attachmentDuration, language] = await message.guild.writeSettings((settings) => {
			Reflect.set(settings, key, value);
			return [
				settings[GuildSettings.Selfmod.Attachments.Maximum],
				settings[GuildSettings.Selfmod.Attachments.Duration],
				settings.getLanguage()
			];
		});

		// Update the adder
		switch (type) {
			case 'disable':
				message.guild.security.adders.attachments = null;
				break;
			case 'enable':
			case 'maximum':
			case 'duration': {
				if (message.guild.security.adders.attachments) {
					message.guild.security.adders.attachments.maximum = attachmentMaximum;
					message.guild.security.adders.attachments.duration = attachmentDuration;
				} else {
					message.guild.security.adders.attachments = new Adder(attachmentMaximum, attachmentDuration);
				}
				break;
			}
			case 'action':
			case 'logs':
			case 'expire':
				break;
		}

		return message.send(this.getReply(language, languageKey, value));
	}

	private getReply(language: Language, languageKey: typeof TYPES[keyof typeof TYPES]['languageKey'], value: number) {
		switch (languageKey) {
			case 'commandManageAttachmentsAction':
			case 'commandManageAttachmentsLogs':
			case 'commandManageAttachmentsEnabled':
			case 'commandManageAttachmentsDisabled':
				return language.get(languageKey);
			default:
				return language.get(languageKey, { value });
		}
	}
}

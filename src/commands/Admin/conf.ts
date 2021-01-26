import { configurableGroups, isSchemaGroup, isSchemaKey, remove, reset, SchemaKey, set } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SettingsMenu, SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { map } from '#utils/iterator';
import { ApplyOptions } from '@sapphire/decorators';
import { toTitleCase } from '@sapphire/utilities';
import { CreateResolvers, requiredPermissions } from '@skyra/decorators';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['settings', 'config', 'configs', 'configuration'],
	description: LanguageKeys.Commands.Admin.ConfDescription,
	extendedHelp: LanguageKeys.Commands.Admin.ConfExtended,
	guarded: true,
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['text'],
	subcommands: true,
	usage: '<set|show|remove|reset|menu:default> (key:key) (value:value) [...]',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'key',
		async (arg, _possible, message, [action]: string[]) => {
			if (['show', 'menu'].includes(action) || arg) return arg || '';
			throw await message.resolveKey(LanguageKeys.Commands.Admin.ConfNoKey);
		}
	],
	[
		'value',
		async (arg, possible, message, [action]: string[]) => {
			if (!['set', 'remove'].includes(action)) return null;
			if (arg) return message.client.arguments.get('...string')!.run(arg, possible, message);
			throw await message.resolveKey(LanguageKeys.Commands.Admin.ConfNoValue);
		}
	]
])
export class UserCommand extends SkyraCommand {
	@requiredPermissions(['ADD_REACTIONS', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'])
	public async menu(message: GuildMessage) {
		return new SettingsMenu(message, await message.fetchT()).init();
	}

	public async show(message: GuildMessage, [key]: [string]) {
		const schemaValue = configurableGroups.getPathString(key);
		if (schemaValue === null) throw await message.resolveKey(LanguageKeys.Commands.Admin.ConfGetNoExt, { key });

		const [output, t] = await message.guild.readSettings((settings) => {
			const language = settings.getLanguage();
			return [schemaValue.display(settings, language), language];
		});

		if (isSchemaKey(schemaValue)) {
			return message.send(t(LanguageKeys.Commands.Admin.ConfGet, { key, value: output }), {
				allowedMentions: { users: [], roles: [] }
			});
		}

		const title = key ? `: ${key.split('.').map(toTitleCase).join('/')}` : '';
		return message.send(t(LanguageKeys.Commands.Admin.Conf, { key: title, list: output }), {
			allowedMentions: { users: [], roles: [] }
		});
	}

	public async set(message: GuildMessage, [key, valueToSet]: string[]) {
		const schemaKey = await this.fetchKey(message, key);
		const [response, t] = await message.guild.writeSettings(async (settings) => {
			const language = await set(settings, schemaKey, valueToSet);
			return [schemaKey.display(settings, language), language];
		});

		return message.send(t(LanguageKeys.Commands.Admin.ConfUpdated, { key, response }), {
			allowedMentions: { users: [], roles: [] }
		});
	}

	public async remove(message: GuildMessage, [key, valueToRemove]: string[]) {
		const schemaKey = await this.fetchKey(message, key);
		const [response, t] = await message.guild.writeSettings(async (settings) => {
			const language = await remove(settings, schemaKey, valueToRemove);
			return [schemaKey.display(settings, language), language];
		});

		return message.send(t(LanguageKeys.Commands.Admin.ConfUpdated, { key, response }), {
			allowedMentions: { users: [], roles: [] }
		});
	}

	public async reset(message: GuildMessage, [key]: string[]) {
		const schemaKey = await this.fetchKey(message, key);
		const [response, t] = await message.guild.writeSettings(async (settings) => {
			const language = reset(settings, schemaKey);
			return [schemaKey.display(settings, language), language];
		});

		return message.send(t(LanguageKeys.Commands.Admin.ConfReset, { key, value: response }), {
			allowedMentions: { users: [], roles: [] }
		});
	}

	private async fetchKey(message: GuildMessage, key: string): Promise<SchemaKey> {
		const value = configurableGroups.getPathString(key);
		if (value === null) throw await message.resolveKey(LanguageKeys.Commands.Admin.ConfGetNoExt, { key });
		if (value.dashboardOnly) throw await message.resolveKey(LanguageKeys.Commands.Admin.ConfDashboardOnlyKey, { key });
		if (isSchemaGroup(value)) {
			throw await message.resolveKey(LanguageKeys.Settings.Gateway.ChooseKey, {
				keys: [...map(value.childKeys(), (value) => `\`${value}\``)].join(', ')
			});
		}

		return value as SchemaKey;
	}
}

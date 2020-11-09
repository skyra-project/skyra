import { configurableGroups, isSchemaKey, isSchemaGroup, SchemaKey } from '@lib/database';
import { map } from '@lib/misc';
import { SettingsMenu } from '@lib/structures/SettingsMenu';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { GuildMessage } from '@lib/types';
import { PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { toTitleCase } from '@sapphire/utilities';
import { ApplyOptions, requiredPermissions } from '@skyra/decorators';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['settings', 'config', 'configs', 'configuration'],
	description: (language) => language.get(LanguageKeys.Commands.Admin.ConfDescription),
	guarded: true,
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['text'],
	subcommands: true,
	usage: '<set|show|remove|reset|menu:default> (key:key) (value:value) [...]',
	usageDelim: ' '
})
export default class extends SkyraCommand {
	@requiredPermissions(['ADD_REACTIONS', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'])
	public async menu(message: GuildMessage) {
		return new SettingsMenu(message, await message.fetchLanguage()).init();
	}

	public async show(message: GuildMessage, [key]: [string]) {
		const schemaValue = configurableGroups.getPathString(key);
		if (schemaValue === null) throw await message.fetchLocale(LanguageKeys.Commands.Admin.ConfGetNoExt, { key });

		const [output, language] = await message.guild.readSettings((settings) => {
			const language = settings.getLanguage();
			return [schemaValue.display(settings, language), language];
		});

		if (isSchemaKey(schemaValue)) {
			return message.send(language.get(LanguageKeys.Commands.Admin.ConfGet, { key, value: output }), {
				allowedMentions: { users: [], roles: [] }
			});
		}

		const title = key ? `: ${key.split('.').map(toTitleCase).join('/')}` : '';
		return message.send(language.get(LanguageKeys.Commands.Admin.Conf, { key: title, list: output }), {
			allowedMentions: { users: [], roles: [] }
		});
	}

	public async set(message: GuildMessage, [key, valueToSet]: string[]) {
		const schemaKey = await this.fetchKey(message, key);
		const [response, language] = await message.guild.writeSettings(async (settings) => {
			const language = settings.getLanguage();

			const parsed = await schemaKey.parse(settings, language, valueToSet);
			if (schemaKey.array) {
				const values = Reflect.get(settings, schemaKey.name) as any[];
				const { serializer } = schemaKey;
				const index = values.findIndex((value) => serializer.equals(value, parsed));
				if (index === -1) values.push(parsed);
				else values[index] = parsed;
			} else {
				const value = Reflect.get(settings, schemaKey.name);
				const { serializer } = schemaKey;
				if (serializer.equals(value, parsed)) {
					throw language.get(LanguageKeys.Settings.Gateway.DuplicateValue, {
						path: schemaKey.name,
						value: schemaKey.stringify(settings, language, parsed)
					});
				}

				Reflect.set(settings, schemaKey.name, parsed);
			}

			return [schemaKey.display(settings, language), language];
		});

		return message.send(language.get(LanguageKeys.Commands.Admin.ConfUpdated, { key, response }), {
			allowedMentions: { users: [], roles: [] }
		});
	}

	public async remove(message: GuildMessage, [key, valueToRemove]: string[]) {
		const schemaKey = await this.fetchKey(message, key);
		const [response, language] = await message.guild.writeSettings(async (settings) => {
			const language = settings.getLanguage();

			const parsed = await schemaKey.parse(settings, language, valueToRemove);
			if (schemaKey.array) {
				const values = Reflect.get(settings, schemaKey.name) as any[];
				const { serializer } = schemaKey;
				const index = values.findIndex((value) => serializer.equals(value, parsed));
				if (index === -1) {
					throw language.get(LanguageKeys.Settings.Gateway.MissingValue, {
						path: schemaKey.name,
						value: schemaKey.stringify(settings, language, parsed)
					});
				}

				values.splice(index, 1);
			} else {
				Reflect.set(settings, schemaKey.name, schemaKey.default);
			}

			return [schemaKey.display(settings, language), language];
		});

		return message.send(language.get(LanguageKeys.Commands.Admin.ConfUpdated, { key, response }), { allowedMentions: { users: [], roles: [] } });
	}

	public async reset(message: GuildMessage, [key]: string[]) {
		const schemaKey = await this.fetchKey(message, key);
		const [response, language] = await message.guild.writeSettings(async (settings) => {
			const language = settings.getLanguage();
			Reflect.set(settings, schemaKey.name, schemaKey.default);
			return [schemaKey.display(settings, language), language];
		});

		return message.send(language.get(LanguageKeys.Commands.Admin.ConfReset, { key, value: response }), {
			allowedMentions: { users: [], roles: [] }
		});
	}

	public async init() {
		this.createCustomResolver('key', async (arg, _possible, message, [action]: string[]) => {
			if (['show', 'menu'].includes(action) || arg) return arg || '';
			throw await message.fetchLocale(LanguageKeys.Commands.Admin.ConfNoKey);
		});

		this.createCustomResolver('value', async (arg, possible, message, [action]: string[]) => {
			if (!['set', 'remove'].includes(action)) return null;
			if (arg) return this.client.arguments.get('...string')!.run(arg, possible, message);
			throw await message.fetchLocale(LanguageKeys.Commands.Admin.ConfNoValue);
		});
	}

	private async fetchKey(message: GuildMessage, key: string): Promise<SchemaKey> {
		const value = configurableGroups.getPathString(key);
		if (value === null) throw await message.fetchLocale(LanguageKeys.Commands.Admin.ConfGetNoExt, { key });
		if (isSchemaGroup(value)) {
			throw await message.fetchLocale(LanguageKeys.Settings.Gateway.ChooseKey, {
				keys: [...map(value.childKeys(), (value) => `\`${value}\``)].join(', ')
			});
		}

		return value as SchemaKey;
	}
}

import { SettingsMenu } from '@lib/structures/SettingsMenu';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { codeBlock, toTitleCase } from '@sapphire/utilities';
import { ApplyOptions, requiredPermissions } from '@skyra/decorators';
import { configurableSchemaKeys, displayEntry, displayFolder, initConfigurableSchema, isSchemaEntry } from '@utils/SettingsUtils';
import { KlasaMessage, SettingsFolder } from 'klasa';

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
	public menu(message: KlasaMessage) {
		return new SettingsMenu(message).init();
	}

	public show(message: KlasaMessage, [key]: [string]) {
		const schemaOrEntry = configurableSchemaKeys.get(key);
		if (typeof schemaOrEntry === 'undefined') throw message.language.get(LanguageKeys.Commands.Admin.ConfGetNoExt, { key });

		const value = key ? message.guild!.settings.get(key) : message.guild!.settings;
		if (isSchemaEntry(schemaOrEntry)) {
			return message.sendLocale(LanguageKeys.Commands.Admin.ConfGet, [
				{
					key,
					value: displayEntry(schemaOrEntry, message.guild!.settings.get(key), message.guild!)
				}
			]);
		}

		return message.sendLocale(LanguageKeys.Commands.Admin.Conf, [
			{
				key: key ? `: ${key.split('.').map(toTitleCase).join('/')}` : '',
				list: codeBlock('asciidoc', displayFolder(value as SettingsFolder))
			}
		]);
	}

	public async set(message: KlasaMessage, [key, valueToSet]: string[]) {
		try {
			const [update] = await message.guild!.settings.update(key, valueToSet, {
				arrayAction: 'add',
				onlyConfigurable: true,
				extraContext: { author: message.author.id }
			});
			return message.sendLocale(LanguageKeys.Commands.Admin.ConfUpdated, [
				{ key, response: displayEntry(update.entry, update.next, message.guild!) }
			]);
		} catch (error) {
			throw String(error);
		}
	}

	public async remove(message: KlasaMessage, [key, valueToRemove]: string[]) {
		try {
			const [update] = await message.guild!.settings.update(key, valueToRemove, {
				arrayAction: 'remove',
				onlyConfigurable: true,
				extraContext: { author: message.author.id }
			});

			return message.sendLocale(LanguageKeys.Commands.Admin.ConfUpdated, [
				{ key, response: displayEntry(update.entry, update.next, message.guild!) }
			]);
		} catch (error) {
			throw String(error);
		}
	}

	public async reset(message: KlasaMessage, [key]: string[]) {
		try {
			const [update] = await message.guild!.settings.reset(key, { extraContext: message.author.id });
			return message.sendLocale(LanguageKeys.Commands.Admin.ConfReset, [
				{ key, value: displayEntry(update.entry, update.next, message.guild!) }
			]);
		} catch (error) {
			throw String(error);
		}
	}

	public async init() {
		initConfigurableSchema(this.client.gateways.get('guilds')!.schema);

		this.createCustomResolver('key', (arg, _possible, message, [action]: string[]) => {
			if (['show', 'menu'].includes(action) || arg) return arg || '';
			throw message.language.get(LanguageKeys.Commands.Admin.ConfNoKey);
		});

		this.createCustomResolver('value', (arg, possible, message, [action]: string[]) => {
			if (!['set', 'remove'].includes(action)) return null;
			if (arg) return this.client.arguments.get('...string')!.run(arg, possible, message);
			throw message.language.get(LanguageKeys.Commands.Admin.ConfNoValue);
		});
	}
}

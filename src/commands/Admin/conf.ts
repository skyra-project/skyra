import { codeBlock, toTitleCase } from '@klasa/utils';
import { SettingsMenu } from '@lib/structures/SettingsMenu';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { configurableSchemaKeys, displayEntry, displayFolder, initConfigurableSchema, isSchemaEntry } from '@utils/SettingsUtils';
import { Permissions, TextChannel } from 'discord.js';
import { KlasaMessage, SettingsFolder } from 'klasa';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['settings', 'config', 'configs', 'configuration'],
	description: language => language.tget('COMMAND_CONF_SERVER_DESCRIPTION'),
	guarded: true,
	permissionLevel: PermissionLevels.Administrator,
	requiredPermissions: ['ADD_REACTIONS', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'],
	runIn: ['text'],
	subcommands: true,
	usage: '<set|show|remove|reset|menu:default> (key:key) (value:value) [...]',
	usageDelim: ' '
})
export default class extends SkyraCommand {

	private readonly kMenuRequirements = Permissions.resolve([
		Permissions.FLAGS.ADD_REACTIONS,
		Permissions.FLAGS.MANAGE_MESSAGES,
		Permissions.FLAGS.EMBED_LINKS
	]);

	public menu(message: KlasaMessage) {
		if (!(message.channel as TextChannel).permissionsFor(this.client.user!.id)!.has(this.kMenuRequirements)) {
			throw message.language.tget('COMMAND_CONF_MENU_NOPERMISSIONS');
		}
		return new SettingsMenu(message).init();
	}

	public show(message: KlasaMessage, [key]: [string]) {
		const schemaOrEntry = configurableSchemaKeys.get(key);
		if (typeof schemaOrEntry === 'undefined') throw message.language.tget('COMMAND_CONF_GET_NOEXT', key);

		const value = key ? message.guild!.settings.get(key) : message.guild!.settings;
		if (isSchemaEntry(schemaOrEntry)) {
			return message.sendLocale('COMMAND_CONF_GET', [key, displayEntry(schemaOrEntry, message.guild!.settings.get(key), message.guild!)]);
		}

		return message.sendLocale('COMMAND_CONF_SERVER', [
			// eslint-disable-next-line @typescript-eslint/unbound-method
			key ? `: ${key.split('.').map(toTitleCase).join('/')}` : '',
			codeBlock('asciidoc', displayFolder(value as SettingsFolder))
		]);
	}

	public async set(message: KlasaMessage, [key, valueToSet]: string[]) {
		try {
			const [update] = await message.guild!.settings.update(key, valueToSet, {
				arrayAction: 'add',
				onlyConfigurable: true,
				extraContext: { author: message.author.id }
			});
			return message.sendLocale('COMMAND_CONF_UPDATED', [key, displayEntry(update.entry, update.next, message.guild!)]);
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
			return message.sendLocale('COMMAND_CONF_UPDATED', [key, displayEntry(update.entry, update.next, message.guild!)]);
		} catch (error) {
			throw String(error);
		}
	}

	public async reset(message: KlasaMessage, [key]: string[]) {
		try {
			const [update] = await message.guild!.settings.reset(key, { extraContext: message.author.id });
			return message.sendLocale('COMMAND_CONF_RESET', [key, displayEntry(update.entry, update.next, message.guild!)]);
		} catch (error) {
			throw String(error);
		}
	}

	public async init() {
		initConfigurableSchema(this.client.gateways.get('guilds')!.schema);

		this.createCustomResolver('key', (arg, _possible, message, [action]: string[]) => {
			if (['show', 'menu'].includes(action) || arg) return arg || '';
			throw message.language.tget('COMMAND_CONF_NOKEY');
		});

		this.createCustomResolver('value', (arg, possible, message, [action]: string[]) => {
			if (!['set', 'remove'].includes(action)) return null;
			if (arg) return this.client.arguments.get('...string')!.run(arg, possible, message);
			throw message.language.tget('COMMAND_CONF_NOVALUE');
		});
	}

}

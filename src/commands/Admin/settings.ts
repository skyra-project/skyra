import { Permissions, TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage, Schema, SchemaEntry, SettingsFolderUpdateResult, util } from 'klasa';
import { SettingsMenu } from '../../lib/structures/SettingsMenu';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';

const MENU_REQUIREMENTS = Permissions.resolve([Permissions.FLAGS.ADD_REACTIONS, Permissions.FLAGS.MANAGE_MESSAGES]);

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['conf', 'config', 'configs', 'configuration'],
			description: language => language.tget('COMMAND_CONF_SERVER_DESCRIPTION'),
			guarded: true,
			permissionLevel: 6,
			requiredPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			subcommands: true,
			usage: '<set|show|remove|reset|menu:default> (key:key) (value:value) [...]',
			usageDelim: ' '
		});

		this
			.createCustomResolver('key', (arg, _, message, [action]: string[]) => {
				if (['show', 'menu'].includes(action) || arg) return arg;
				throw message.language.tget('COMMAND_CONF_NOKEY');
			})
			.createCustomResolver('value', (arg, _, message, [action]: string[]) => {
				if (!['set', 'remove'].includes(action) || arg) return arg;
				throw message.language.tget('COMMAND_CONF_NOVALUE');
			});
	}

	public menu(message: KlasaMessage) {
		if (!(message.channel as TextChannel).permissionsFor(this.client.user!.id)!.has(MENU_REQUIREMENTS)) {
			throw message.language.tget('COMMAND_CONF_MENU_NOPERMISSIONS');
		}
		return new SettingsMenu(message).init();
	}

	public show(message: KlasaMessage, [key]: [string]) {
		const piece = this.getPath(key);
		if (!piece || (piece.type === 'Folder'
			? !(piece as Schema).configurableKeys.length
			: !(piece as SchemaEntry).configurable)) return message.sendLocale('COMMAND_CONF_GET_NOEXT', [key]);
		if (piece.type === 'Folder') {
			return message.sendLocale('COMMAND_CONF_SERVER', [
				// eslint-disable-next-line @typescript-eslint/unbound-method
				key ? `: ${key.split('.').map(util.toTitleCase).join('/')}` : '',
				util.codeBlock('asciidoc', message.guild!.settings.display(message, piece))
			]);
		}
		return message.sendLocale('COMMAND_CONF_GET', [piece.path, message.guild!.settings.display(message, piece)]);
	}

	public async set(message: KlasaMessage, [key, ...valueToSet]: string[]) {
		const status = await message.guild!.settings.update(key, valueToSet.join(' '), { onlyConfigurable: true, arrayAction: 'add' });
		return this.check(message, key, status) || message.sendLocale('COMMAND_CONF_UPDATED', [key, message.guild!.settings.display(message, status.updated[0].entry)]);
	}

	public async remove(message: KlasaMessage, [key, ...valueToRemove]: string[]) {
		const status = await message.guild!.settings.update(key, valueToRemove.join(' '), { onlyConfigurable: true, arrayAction: 'remove' });
		return this.check(message, key, status) || message.sendLocale('COMMAND_CONF_UPDATED', [key, message.guild!.settings.display(message, status.updated[0].entry)]);
	}

	public async reset(message: KlasaMessage, [key]: string[]) {
		const status = await message.guild!.settings.reset(key);
		return this.check(message, key, status) || message.sendLocale('COMMAND_CONF_RESET', [key, message.guild!.settings.display(message, status.updated[0].entry)]);
	}

	private getPath(key: string) {
		const { schema } = this.client.gateways.get('guilds')!;
		if (!key) return schema;
		try {
			return schema.get(key);
		} catch {
			return undefined;
		}
	}

	private check(message: KlasaMessage, key: string, { errors, updated }: SettingsFolderUpdateResult) {
		if (errors.length) return message.sendMessage(errors[0]);
		if (!updated.length) return message.sendLocale('COMMAND_CONF_NOCHANGE', [key]);
		return null;
	}

}

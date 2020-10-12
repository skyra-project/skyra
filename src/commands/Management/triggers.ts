import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { chunk } from '@sapphire/utilities';
import { ApplyOptions, requiredPermissions } from '@skyra/decorators';
import { displayEmoji, resolveEmoji } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

const REG_TYPE = /^(alias|reaction)$/i;

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 5,
	description: (language) => language.get(LanguageKeys.Commands.Management.TriggersDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.TriggersExtended),
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['text'],
	subcommands: true,
	usage: '<add|remove|show:default> (type:type) (input:input) (output:output)',
	usageDelim: ' '
})
export default class extends SkyraCommand {
	public async init() {
		this.createCustomResolver('type', (arg, _, msg, [action]) => {
			if (action === 'show') return undefined;
			if (REG_TYPE.test(arg)) return arg.toLowerCase();
			throw msg.language.get(LanguageKeys.Commands.Management.TriggersNotype);
		})
			.createCustomResolver('input', (arg, _, msg, [action]) => {
				if (action === 'show') return undefined;
				if (!arg) throw msg.language.get(LanguageKeys.Commands.Management.TriggersNooutput);
				return arg.toLowerCase();
			})
			.createCustomResolver('output', async (arg, _, message, [action, type]) => {
				if (action === 'show' || action === 'remove') return undefined;
				if (!arg) throw message.language.get(LanguageKeys.Commands.Management.TriggersNooutput);
				if (type === 'reaction') {
					const emoji = resolveEmoji(arg);
					if (!emoji) throw message.language.get(LanguageKeys.Commands.Management.TriggersInvalidreaction);

					try {
						await message.react(emoji);
						return emoji;
					} catch {
						throw message.language.get(LanguageKeys.Commands.Management.TriggersInvalidreaction);
					}
				} else if (type === 'alias') {
					const command = this.client.commands.get(arg);
					if (command && command.permissionLevel < 10) return command.name;
					throw message.language.get(LanguageKeys.Commands.Management.TriggersInvalidalias);
				} else {
					return null;
				}
			});
	}

	public async remove(message: KlasaMessage, [type, input]: [string, string]) {
		const list = this._getList(message, type);
		const index = list.findIndex((entry) => entry.input === input);
		if (index === -1) throw message.language.get(LanguageKeys.Commands.Management.TriggersRemoveNottaken);

		// Create a shallow clone and remove the item
		const clone = [...list];
		clone.splice(index, 1);

		await message.guild!.settings.update(this._getListName(type), clone, {
			arrayAction: 'overwrite',
			extraContext: { author: message.author.id }
		});
		return message.sendLocale(LanguageKeys.Commands.Management.TriggersRemove);
	}

	public async add(message: KlasaMessage, [type, input, output]: [string, string, string]) {
		const list = this._getList(message, type);
		if (list.some((entry) => entry.input === input)) throw message.language.get(LanguageKeys.Commands.Management.TriggersAddTaken);

		await message.guild!.settings.update(this._getListName(type), [...list, this._format(type, input, output)], {
			arrayAction: 'overwrite',
			extraContext: { author: message.author.id }
		});
		return message.sendLocale(LanguageKeys.Commands.Management.TriggersAdd);
	}

	@requiredPermissions(['ADD_REACTIONS', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'])
	public async show(message: KlasaMessage) {
		const aliases = message.guild!.settings.get(GuildSettings.Trigger.Alias);
		const includes = message.guild!.settings.get(GuildSettings.Trigger.Includes);
		const output: string[] = [];
		for (const alias of aliases) {
			output.push(`Alias \`${alias.input}\` -> \`${alias.output}\``);
		}
		for (const react of includes) {
			output.push(`Reaction :: \`${react.input}\` -> ${displayEmoji(react.output)}`);
		}
		if (!output.length) throw message.language.get(LanguageKeys.Commands.Management.TriggersListEmpty);

		const display = new UserRichDisplay(
			new MessageEmbed()
				.setAuthor(message.author.username, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
				.setColor(await DbSet.fetchColor(message))
		);

		for (const page of chunk(output, 10)) {
			display.addPage((embed: MessageEmbed) => embed.setDescription(page));
		}

		return display.start(message, undefined, { time: 120000 });
	}

	private _format(type: string, input: string, output: string) {
		switch (type) {
			case 'alias':
				return { input, output };
			case 'reaction':
				return { action: 'react', input, output };
			default:
				throw new TypeError(`Unknown Type: ${type}`);
		}
	}

	private _getListName(type: string) {
		switch (type) {
			case 'alias':
				return GuildSettings.Trigger.Alias;
			case 'reaction':
			default:
				return GuildSettings.Trigger.Includes;
		}
	}

	private _getList(message: KlasaMessage, type: string) {
		switch (type) {
			case 'alias':
				return message.guild!.settings.get(GuildSettings.Trigger.Alias);
			case 'reaction':
			default:
				return message.guild!.settings.get(GuildSettings.Trigger.Includes);
		}
	}
}

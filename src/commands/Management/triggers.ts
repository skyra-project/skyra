import { DbSet, GuildSettings } from '@lib/database';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { GuildMessage } from '@lib/types';
import { PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { chunk } from '@sapphire/utilities';
import { ApplyOptions, CreateResolvers, requiredPermissions } from '@skyra/decorators';
import { displayEmoji, resolveEmoji } from '@utils/util';
import { MessageEmbed } from 'discord.js';

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
@CreateResolvers([
	[
		'type',
		async (arg, _, message, [action]) => {
			if (action === 'show') return undefined;
			if (REG_TYPE.test(arg)) return arg.toLowerCase();
			throw await message.fetchLocale(LanguageKeys.Commands.Management.TriggersNotype);
		}
	],
	[
		'input',
		async (arg, _, message, [action]) => {
			if (action === 'show') return undefined;
			if (!arg) throw await message.fetchLocale(LanguageKeys.Commands.Management.TriggersNooutput);
			return arg.toLowerCase();
		}
	],
	[
		'output',
		async (arg, _, message, [action, type]) => {
			if (action === 'show' || action === 'remove') return undefined;
			if (!arg) throw await message.fetchLocale(LanguageKeys.Commands.Management.TriggersNooutput);
			if (type === 'reaction') {
				const emoji = resolveEmoji(arg);
				if (!emoji) throw await message.fetchLocale(LanguageKeys.Commands.Management.TriggersInvalidreaction);

				try {
					await message.react(emoji);
					return emoji;
				} catch {
					throw await message.fetchLocale(LanguageKeys.Commands.Management.TriggersInvalidreaction);
				}
			} else if (type === 'alias') {
				const command = message.client.commands.get(arg);
				if (command && command.permissionLevel < 10) return command.name;
				throw await message.fetchLocale(LanguageKeys.Commands.Management.TriggersInvalidalias);
			} else {
				return null;
			}
		}
	]
])
export default class extends SkyraCommand {
	public async remove(message: GuildMessage, [type, input]: [string, string]) {
		const list = await this.getList(message, type);

		const index = list.findIndex((entry) => entry.input === input);
		if (index === -1) throw await message.fetchLocale(LanguageKeys.Commands.Management.TriggersRemoveNottaken);

		// Create a shallow clone and remove the item
		const clone = [...list];
		clone.splice(index, 1);

		await message.guild.writeSettings([[this.getListName(type), clone]]);
		return message.sendLocale(LanguageKeys.Commands.Management.TriggersRemove);
	}

	public async add(message: GuildMessage, [type, input, output]: [string, string, string]) {
		const list = await this.getList(message, type);
		if (list.some((entry) => entry.input === input)) throw await message.fetchLocale(LanguageKeys.Commands.Management.TriggersAddTaken);

		await message.guild.writeSettings([[this.getListName(type), [...list, this.format(type, input, output)]]]);
		return message.sendLocale(LanguageKeys.Commands.Management.TriggersAdd);
	}

	@requiredPermissions(['ADD_REACTIONS', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'])
	public async show(message: GuildMessage) {
		const [aliases, includes, language] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.Trigger.Alias],
			settings[GuildSettings.Trigger.Includes],
			settings.getLanguage()
		]);

		const output: string[] = [];
		for (const alias of aliases) {
			output.push(`Alias \`${alias.input}\` -> \`${alias.output}\``);
		}
		for (const react of includes) {
			output.push(`Reaction :: \`${react.input}\` -> ${displayEmoji(react.output)}`);
		}
		if (!output.length) throw language.get(LanguageKeys.Commands.Management.TriggersListEmpty);

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

	private format(type: string, input: string, output: string) {
		switch (type) {
			case 'alias':
				return { input, output };
			case 'reaction':
				return { action: 'react', input, output };
			default:
				throw new TypeError(`Unknown Type: ${type}`);
		}
	}

	private getListName(type: string) {
		switch (type) {
			case 'alias':
				return GuildSettings.Trigger.Alias;
			case 'reaction':
			default:
				return GuildSettings.Trigger.Includes;
		}
	}

	private async getList(message: GuildMessage, type: string) {
		switch (type) {
			case 'alias':
				return message.guild.readSettings(GuildSettings.Trigger.Alias);
			case 'reaction':
			default:
				return message.guild.readSettings(GuildSettings.Trigger.Includes);
		}
	}
}

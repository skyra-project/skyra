import { DbSet, GuildSettings, TriggerAlias, TriggerIncludes } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { UserRichDisplay } from '#lib/structures/UserRichDisplay';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { displayEmoji, resolveEmoji } from '#utils/util';
import { chunk } from '@sapphire/utilities';
import { ApplyOptions, CreateResolvers, requiredPermissions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';

const REG_TYPE = /^(alias|reaction)$/i;

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 5,
	description: LanguageKeys.Commands.Management.TriggersDescription,
	extendedHelp: LanguageKeys.Commands.Management.TriggersExtended,
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
			throw await message.resolveKey(LanguageKeys.Commands.Management.TriggersNoType);
		}
	],
	[
		'input',
		async (arg, _, message, [action]) => {
			if (action === 'show') return undefined;
			if (!arg) throw await message.resolveKey(LanguageKeys.Commands.Management.TriggersNoOutput);
			return arg.toLowerCase();
		}
	],
	[
		'output',
		async (arg, _, message, [action, type]) => {
			if (action === 'show' || action === 'remove') return undefined;
			if (!arg) throw await message.resolveKey(LanguageKeys.Commands.Management.TriggersNoOutput);
			if (type === 'reaction') {
				const emoji = resolveEmoji(arg);
				if (!emoji) throw await message.resolveKey(LanguageKeys.Commands.Management.TriggersInvalidReaction);

				try {
					await message.react(emoji);
					return emoji;
				} catch {
					throw await message.resolveKey(LanguageKeys.Commands.Management.TriggersInvalidReaction);
				}
			}

			if (type === 'alias') {
				const command = message.client.commands.get(arg);
				if (command && command.permissionLevel < PermissionLevels.BotOwner) return command.name;
				throw await message.resolveKey(LanguageKeys.Commands.Management.TriggersInvalidAlias);
			}

			return null;
		}
	]
])
export default class extends SkyraCommand {
	public async remove(message: GuildMessage, [type, input]: [string, string]) {
		const t = await message.guild.writeSettings((settings) => {
			const t = settings.getLanguage();
			const key = this.getListName(type);

			const list = settings[key];

			const index = list.findIndex((entry) => entry.input === input);
			if (index === -1) throw t(LanguageKeys.Commands.Management.TriggersRemoveNotTaken);

			list.splice(index, 1);

			return t;
		});

		return message.send(t(LanguageKeys.Commands.Management.TriggersRemove));
	}

	public async add(message: GuildMessage, [type, input, output]: [string, string, string]) {
		const t = await message.guild.writeSettings((settings) => {
			const t = settings.getLanguage();
			const key = this.getListName(type);

			const list = settings[key];

			const alreadySet = list.some((entry) => entry.input === input);
			if (alreadySet) throw t(LanguageKeys.Commands.Management.TriggersAddTaken);

			list.push(this.format(type, input, output) as any);

			return t;
		});

		return message.send(t(LanguageKeys.Commands.Management.TriggersAdd));
	}

	@requiredPermissions(['ADD_REACTIONS', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'])
	public async show(message: GuildMessage) {
		const [aliases, includes, t] = await message.guild.readSettings((settings) => [
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
		if (!output.length) throw t(LanguageKeys.Commands.Management.TriggersListEmpty);

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

	private format(type: string, input: string, output: string): TriggerIncludes | TriggerAlias {
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
}

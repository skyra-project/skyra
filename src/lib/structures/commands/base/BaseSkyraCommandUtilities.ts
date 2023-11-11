import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { SkyraArgs } from '#lib/structures/commands/SkyraArgs';
import { PermissionLevels, type CustomGet } from '#lib/types';
import { OWNERS } from '#root/config';
import { seconds } from '#utils/common';
import { Command, PreconditionContainerArray, UserError, type MessageCommand } from '@sapphire/framework';
import { fetchT } from '@sapphire/plugin-i18next';
import { PermissionFlagsBits, PermissionsBitField, type Message } from 'discord.js';

export const SkyraCommandConstructorDefaults = {
	cooldownDelay: seconds(10),
	cooldownLimit: 2,
	cooldownFilteredUsers: OWNERS,
	generateDashLessAliases: true,
	guarded: false,
	hidden: false,
	permissionLevel: PermissionLevels.Everyone
} satisfies Partial<ExtendOptions<Command.Options>>;

export async function implementSkyraCommandPreParse(
	command: MessageCommand,
	message: Message,
	parameters: string,
	context: MessageCommand.RunContext
): Promise<SkyraArgs> {
	return SkyraArgs.from(command, message, parameters, context, await fetchT(message));
}

export function implementSkyraCommandError(identifier: string | UserError, context?: unknown): never {
	throw typeof identifier === 'string' ? new UserError({ identifier, context }) : identifier;
}

export function implementSkyraCommandParseConstructorPreConditionsPermissionLevel(
	command: Command,
	permissionLevel: PermissionLevels = PermissionLevels.Everyone
): void {
	if (permissionLevel === PermissionLevels.BotOwner) {
		command.preconditions.append('BotOwner');
		return;
	}

	const container = new PreconditionContainerArray(['BotOwner'], command.preconditions);
	switch (permissionLevel) {
		case PermissionLevels.Everyone:
			container.append('Everyone');
			break;
		case PermissionLevels.Moderator:
			container.append('Moderator');
			break;
		case PermissionLevels.Administrator:
			container.append('Administrator');
			break;
		case PermissionLevels.ServerOwner:
			container.append('ServerOwner');
			break;
		default:
			throw new Error(`SkyraCommand[${command.name}]: "permissionLevel" was specified as an invalid permission level (${permissionLevel}).`);
	}

	command.preconditions.append(container);
}

export function implementSkyraCommandPaginatedOptions<T extends ExtendOptions<Command.Options> = ExtendOptions<Command.Options>>(options?: T): T {
	return {
		cooldownDelay: seconds(15),
		// Merge in all given options
		...options,
		// Add all requiredPermissions set in the command, along EmbedLinks to send EmbedBuilder's
		requiredClientPermissions: new PermissionsBitField(options?.requiredClientPermissions).add(PermissionFlagsBits.EmbedLinks)
	} as unknown as T;
}

export type ExtendOptions<T> = T & {
	description: CustomGet<string, string>;
	detailedDescription: CustomGet<string, LanguageHelpDisplayOptions>;
	guarded?: boolean;
	hidden?: boolean;
	permissionLevel?: number;
};

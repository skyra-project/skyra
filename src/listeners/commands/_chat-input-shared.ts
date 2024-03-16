import { getSupportedUserLanguageT } from '#lib/i18n/translate';
import { type ChatInputCommandErrorPayload } from '@sapphire/framework';
import type { ChatInputSubcommandErrorPayload } from '@sapphire/plugin-subcommands';
import { MessageFlags } from 'discord.js';
import { flattenError, generateUnexpectedErrorMessage, resolveError } from './_shared.js';

export async function handleCommandError(error: unknown, payload: ChatInputCommandErrorPayload | ChatInputSubcommandErrorPayload) {
	const { interaction } = payload;
	const t = getSupportedUserLanguageT(interaction);
	const resolved = flattenError(payload.command, error);
	const content = resolved ? resolveError(t, resolved) : generateUnexpectedErrorMessage(interaction.user.id, payload.command, t, error);

	if (interaction.replied) await interaction.followUp({ content, flags: MessageFlags.Ephemeral });
	else await interaction.reply({ content, flags: MessageFlags.Ephemeral });
}

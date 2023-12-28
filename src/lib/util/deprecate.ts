import { Invites } from '#lib/util/constants';
import { ActionRowBuilder, ButtonBuilder, inlineCode, type MessageActionRowComponentBuilder } from '@discordjs/builders';
import { isNullishOrEmpty } from '@sapphire/utilities';
import { ButtonStyle } from 'discord.js';

export function createDeprecatedList(options: Options) {
	const values = new Map<string, readonly string[]>();
	for (const entry of options.entries) {
		const keys = typeof entry.in === 'string' ? [entry.in] : entry.in;
		const value = typeof entry.out === 'string' ? [entry.out] : entry.out;
		for (const key of keys) {
			values.set(key, value);

			// Mimic CommandOptions#generateDashLessAliases:
			if (key.includes('-')) {
				values.set(key.replaceAll('-', ''), value);
			}
		}
	}

	return values;
}

export function makeRemovedMessage(alias: string, row: ActionRowBuilder<MessageActionRowComponentBuilder>) {
	const content = `The command ${inlineCode(alias)} has been removed, please read more information about this change with the button below.`;
	return { content, components: [row], allowedMentions: { users: [], roles: [] } };
}

const listFormatter = new Intl.ListFormat('en-US', { type: 'disjunction' });
export function makeReplacedMessage(alias: string, row: ActionRowBuilder<MessageActionRowComponentBuilder>, list: Map<string, readonly string[]>) {
	const replacement = list.get(alias);
	const content = `The command ${inlineCode(alias)} has been removed${
		isNullishOrEmpty(replacement) ? '' : `, please use ${listFormatter.format(replacement)} instead`
	}. You may need to invite the bot with the button below if the command doesn't work.`;
	return { content, components: [row], allowedMentions: { users: [], roles: [] } };
}

export function makeRow(...buttons: readonly ButtonBuilder[]) {
	return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(...buttons);
}

export const ButtonSkyraV7 = new ButtonBuilder() //
	.setLabel('Blog Post')
	.setStyle(ButtonStyle.Link)
	.setURL('https://blog.skyra.pw/skyra-v7');

export const ButtonInviteTeryl = new ButtonBuilder() //
	.setLabel('Invite Teryl')
	.setStyle(ButtonStyle.Link)
	.setURL(Invites.Teryl);

export const ButtonInviteArtiel = new ButtonBuilder() //
	.setLabel('Invite Artiel')
	.setStyle(ButtonStyle.Link)
	.setURL(Invites.Artiel);

export interface Options {
	entries: { out: string | readonly string[]; in: string | readonly string[] }[];
}

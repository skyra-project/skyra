import { Invites } from '#lib/util/constants';
import { ButtonBuilder, inlineCode } from '@discordjs/builders';
import { isNullishOrEmpty } from '@sapphire/utilities';
import { ButtonStyle, type APIButtonComponent } from 'discord-api-types/v9';
import { MessageActionRow } from 'discord.js';

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

export function makeRemovedMessage(alias: string, row: MessageActionRow) {
	const content = `The command ${inlineCode(alias)} has been removed, please read more information about this change with the button below.`;
	return { content, components: [row], allowedMentions: { users: [], roles: [] } };
}

const listFormatter = new Intl.ListFormat('en-US', { type: 'disjunction' });
export function makeReplacedMessage(alias: string, row: MessageActionRow, list: Map<string, readonly string[]>) {
	const replacement = list.get(alias);
	const content = `The command ${inlineCode(alias)} has been removed${
		isNullishOrEmpty(replacement) ? '' : `, please use ${listFormatter.format(replacement)} instead`
	}. You may need to invite the bot with the button below if the command doesn't work.`;
	return { content, components: [row], allowedMentions: { users: [], roles: [] } };
}

export function makeRow(...buttons: readonly APIButtonComponent[]) {
	return new MessageActionRow().addComponents(...buttons);
}

export const ButtonSkyraV7: APIButtonComponent = new ButtonBuilder()
	.setLabel('Blog Post')
	.setStyle(ButtonStyle.Link)
	.setURL('https://blog.skyra.pw/skyra-v7')
	.toJSON();

export const ButtonInviteDragonite: APIButtonComponent = new ButtonBuilder()
	.setLabel('Invite Dragonite')
	.setStyle(ButtonStyle.Link)
	.setURL(Invites.Dragonite)
	.toJSON();

export const ButtonInviteIriss: APIButtonComponent = new ButtonBuilder()
	.setLabel('Invite Iriss')
	.setStyle(ButtonStyle.Link)
	.setURL(Invites.Iriss)
	.toJSON();

export const ButtonInviteNekokai: APIButtonComponent = new ButtonBuilder()
	.setLabel('Invite Nekokai')
	.setStyle(ButtonStyle.Link)
	.setURL(Invites.Nekokai)
	.toJSON();

export const ButtonInviteTeryl: APIButtonComponent = new ButtonBuilder()
	.setLabel('Invite Teryl')
	.setStyle(ButtonStyle.Link)
	.setURL(Invites.Teryl)
	.toJSON();

export const ButtonInviteArtiel: APIButtonComponent = new ButtonBuilder()
	.setLabel('Invite Artiel')
	.setStyle(ButtonStyle.Link)
	.setURL(Invites.Artiel)
	.toJSON();

export interface Options {
	entries: { out: string | readonly string[]; in: string | readonly string[] }[];
}

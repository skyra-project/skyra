import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { MessageEmbed } from 'discord.js';
import { getColor } from '@util/util';
import { api } from '@util/Models/Api';
import { codeBlock } from '@klasa/utils';
export default class extends SkyraCommand {

	private kLowestCode = 'A'.charCodeAt(0);

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['dh'],
			cooldown: 5,
			description: language => language.tget('COMMAND_DEHOIST_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_DEHOIST_EXTENDED'),
			runIn: ['text'],
			permissionLevel: PermissionLevels.Moderator,
			requiredPermissions: ['MANAGE_NICKNAMES', 'EMBED_LINKS']
		});
	}

	public async run(message: KlasaMessage) {
		let counter = 0;
		const errored: ErroredChange[] = [];
		const members = message.guild!.memberTags;
		const response = await message.sendLocale('SYSTEM_LOADING');

		for (const [memberId, memberTag] of members.manageableMembers()) {
			if (memberTag.nickname && memberTag.nickname.charCodeAt(0) < this.kLowestCode) {
				// Replace the first character of the offending user's with a downwards arrow, bringing'em down, down ,down
				const newNick = `🠷${memberTag.nickname.slice(1)}`;
				try {
					await api(this.client)
						.guilds(message.guild!.id)
						.members(memberId)
						.patch({ data: { nick: newNick }, reason: 'Dehoisting' });
				} catch (error) {
					errored.push({ oldNick: memberTag.nickname, newNick });
				}
				counter++;
			}
		}

		// We're done!
		return response.edit({
			embed: this.prepareFinalEmbed(message, members.size, counter, errored),
			content: null
		});
	}

	private prepareFinalEmbed(message: KlasaMessage, totalMembers: number, dehoistedMembers: number, erroredChanges: ErroredChange[]) {
		const embedLanguage = message.language.tget('COMMAND_DEHOIST_EMBED');
		const embed = new MessageEmbed()
			.setColor(getColor(message))
			.setTitle(embedLanguage.TITLE(message.guild!.memberTags.size));

		let description = embedLanguage.DESCRIPTION(dehoistedMembers);
		if (dehoistedMembers <= 0) description = embedLanguage.DESCRIPTION_NOONE;
		if (erroredChanges.length > 0) {
			description = embedLanguage.DESCRIPTION_WITHERRORS(dehoistedMembers - erroredChanges.length, erroredChanges.length);
			const erroredNicknames = erroredChanges.map(entry => `${entry.oldNick} => ${entry.newNick}`).join('\n');
			const codeblock = codeBlock('js', erroredNicknames);
			embed.addField(embedLanguage.FIELD_ERROR_TITLE, codeblock);
		}
		return embed.setDescription(description);
	}

}

interface ErroredChange {
	oldNick: string;
	newNick: string;
}

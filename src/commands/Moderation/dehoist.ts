import { codeBlock } from '@klasa/utils';
import { DbSet } from '@lib/structures/DbSet';
import { MusicCommandOptions } from '@lib/structures/MusicCommand';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { api } from '@utils/Models/Api';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<MusicCommandOptions>({
	aliases: ['dh'],
	cooldown: 5,
	description: (language) => language.get('COMMAND_DEHOIST_DESCRIPTION'),
	extendedHelp: (language) => language.get('COMMAND_DEHOIST_EXTENDED'),
	runIn: ['text'],
	permissionLevel: PermissionLevels.Moderator,
	requiredPermissions: ['MANAGE_NICKNAMES', 'EMBED_LINKS']
})
export default class extends SkyraCommand {
	private kLowestCode = 'A'.charCodeAt(0);

	public async run(message: KlasaMessage) {
		let counter = 0;
		const errored: ErroredChange[] = [];
		const members = message.guild!.memberTags;
		const response = await message.sendLocale('SYSTEM_LOADING', []);

		for (const [memberId, memberTag] of members.manageableMembers()) {
			const displayName = memberTag.nickname ?? this.client.userTags.get(memberId)!.username;
			if (!displayName) return;

			const char = displayName.codePointAt(0)!;
			if (char > this.kLowestCode) continue;

			// Replace the first character of the offending user's with an UTF-16 character, bringing'em down, down, down.
			// The ternary cuts 2 characters if the 1st codepoint belongs in UTF-16
			const newNick = `🠷${displayName.slice(char <= 0xff ? 1 : 2)}`;
			try {
				await api(this.client)
					.guilds(message.guild!.id)
					.members(memberId)
					.patch({ data: { nick: newNick }, reason: 'Dehoisting' });
			} catch {
				errored.push({ oldNick: displayName, newNick });
			}

			++counter;
		}

		// We're done!
		return response.edit({
			embed: await this.prepareFinalEmbed(message, counter, errored),
			content: null
		});
	}

	private async prepareFinalEmbed(message: KlasaMessage, dehoistedMembers: number, erroredChanges: ErroredChange[]) {
		const embedLanguage = message.language.get('COMMAND_DEHOIST_EMBED', {
			dehoistedMemberCount: dehoistedMembers,
			dehoistedWithErrorsCount: dehoistedMembers - erroredChanges.length,
			errored: erroredChanges.length,
			users: message.guild!.memberTags.size
		});
		const embed = new MessageEmbed()
			.setColor(await DbSet.fetchColor(message)) //
			.setTitle(embedLanguage.TITLE);

		let description = embedLanguage.DESCRIPTION;
		if (dehoistedMembers <= 0) description = embedLanguage.DESCRIPTION_NOONE;
		if (erroredChanges.length > 0) {
			description = embedLanguage.DESCRIPTION_WITHERRORS;
			const erroredNicknames = erroredChanges.map((entry) => `${entry.oldNick} => ${entry.newNick}`).join('\n');
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

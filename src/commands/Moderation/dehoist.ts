import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { PermissionLevels } from '../../lib/types/Enums';
import { MessageEmbed } from 'discord.js';
import { getColor } from '../../lib/util/util';
import { api } from '../../lib/util/Models/Api';

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
			requiredPermissions: ['MANAGE_NICKNAMES']
		});
	}

	public async run(message: KlasaMessage) {
		let counter = 0;
		const promises = [];
		const members = message.guild!.memberTags;
		const response = await message.sendLocale('SYSTEM_LOADING');

		for (const [memberId, memberTag] of members.manageableMembers()) {
			if (memberTag.nickname && memberTag.nickname.charCodeAt(0) < this.kLowestCode) {
				// Replace the first character of the offending user's with a downwards arrow, bringing'em down, down ,down
				const newNickname = `🠷${memberTag.nickname.slice(1)}`;
				promises.push(api(this.client)
					.guilds(message.guild!.id)
					.members(memberId)
					.patch({ data: { nick: newNickname }, reason: 'Dehoisting' }));

				counter++;
			}
		}
		await Promise.all(promises);

		// We're done!
		const embedLanguage = message.language.tget('COMMAND_DEHOIST_EMBED');
		return response.edit(new MessageEmbed()
			.setColor(getColor(message))
			.setTitle(embedLanguage.TITLE(message.guild!.memberTags.size))
			.setDescription(counter === 0 ? embedLanguage.DESCRIPTION_NOONE : embedLanguage.DESCRIPTION(counter)));
	}

}

import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { parse } from '#utils/Color';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['setcolour'],
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Social.SetColorDescription,
	extendedHelp: LanguageKeys.Commands.Social.SetColorExtended,
	permissions: ['EMBED_LINKS'],
	spam: true
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const { hex, b10 } = parse(await args.rest('string'));

		const { users } = await DbSet.connect();
		await users.lock([message.author.id], async (id) => {
			const user = await users.ensureProfile(id);
			user.profile.color = b10.value;
			return user.save();
		});

		return message.send(
			new MessageEmbed()
				.setColor(b10.value)
				.setAuthor(message.author.tag, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
				.setDescription(await message.resolveKey(LanguageKeys.Commands.Social.SetColor, { color: hex.toString() }))
		);
	}
}

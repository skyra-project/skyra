import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { parse } from '#utils/Color';
import { ApplyOptions } from '@skyra/decorators';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['setcolour'],
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Social.SetColorDescription,
	extendedHelp: LanguageKeys.Commands.Social.SetColorExtended,
	requiredPermissions: ['EMBED_LINKS'],
	spam: true,
	usage: '<color:string>'
})
export default class extends SkyraCommand {
	public async run(message: Message, [input]: [string]) {
		const { hex, b10 } = parse(input);

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

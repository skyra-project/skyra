import { DbSet } from '#lib/database';
import { SkyraCommand } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { parse } from '#utils/Color';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['setcolour'],
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get(LanguageKeys.Commands.Social.SetColorDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Social.SetColorExtended),
			requiredPermissions: ['EMBED_LINKS'],
			spam: true,
			usage: '<color:string>'
		});
	}

	public async run(message: KlasaMessage, [input]: [string]) {
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
				.setDescription(await message.fetchLocale(LanguageKeys.Commands.Social.SetColor, { color: hex.toString() }))
		);
	}
}

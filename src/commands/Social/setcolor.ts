import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { parse } from '@utils/Color';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['setcolour'],
			bucket: 2,
			cooldown: 10,
			description: language => language.tget('COMMAND_SETCOLOR_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_SETCOLOR_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			spam: true,
			usage: '<color:string>'
		});
	}

	public async run(message: KlasaMessage, [input]: [string]) {
		const { hex, b10 } = parse(input);

		const { users } = await DbSet.connect();
		await users.lock([message.author.id], async id => {
			const user = await users.ensureProfile(id);

			user.profile.color = b10.value;
			return user.save();
		});

		return message.sendEmbed(new MessageEmbed()
			.setColor(b10.value)
			.setAuthor(message.author.tag, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setDescription(message.language.tget('COMMAND_SETCOLOR', hex.toString())));
	}

}

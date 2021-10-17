import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['setcolour'],
	description: LanguageKeys.Commands.Social.SetColorDescription,
	detailedDescription: LanguageKeys.Commands.Social.SetColorExtended,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks],
	spam: true
})
export class UserCommand extends SkyraCommand {
	public async messageRun(message: Message, args: SkyraCommand.Args) {
		const { hex, b10 } = await args.rest('color');

		const { users } = this.container.db;
		await users.lock([message.author.id], async (id) => {
			const user = await users.ensureProfile(id);
			user.profile.color = b10.value;
			return user.save();
		});

		const embed = new MessageEmbed()
			.setColor(b10.value)
			.setAuthor(message.author.tag, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setDescription(args.t(LanguageKeys.Commands.Social.SetColor, { color: hex.toString() }));
		return send(message, { embeds: [embed] });
	}
}

import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { CdnUrls } from '#utils/constants';
import { getColor, getDisplayAvatar, getTag } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits, type Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Fun.LoveDescription,
	detailedDescription: LanguageKeys.Commands.Fun.LoveExtended,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks]
})
export class UserCommand extends SkyraCommand {
	public override async messageRun(message: Message, args: SkyraCommand.Args) {
		const user = await args.pick('userName');
		const isSelf = message.author.id === user.id;
		const percentage = isSelf ? 1 : Math.random();
		const estimatedPercentage = Math.ceil(percentage * 100);

		let result: string;
		if (estimatedPercentage < 45) {
			result = args.t(LanguageKeys.Commands.Fun.LoveLess45);
		} else if (estimatedPercentage < 75) {
			result = args.t(LanguageKeys.Commands.Fun.LoveLess75);
		} else if (estimatedPercentage < 100) {
			result = args.t(LanguageKeys.Commands.Fun.LoveLess100);
		} else {
			result = args.t(isSelf ? LanguageKeys.Commands.Fun.LoveItself : LanguageKeys.Commands.Fun.Love100);
		}

		const description = [
			`💗 **${getTag(user)}**`,
			`💗 **${getTag(message.author)}**\n`,
			`${estimatedPercentage}% \`[${'█'.repeat(Math.round(percentage * 40)).padEnd(40, '\u00A0')}]\`\n`,
			`**${args.t(LanguageKeys.Commands.Fun.LoveResult)}**: ${result}`
		].join('\n');
		const embed = new EmbedBuilder()
			.setColor(getColor(message))
			.setAuthor({ name: '❤ Love Meter ❤', iconURL: getDisplayAvatar(message.author, { size: 128 }) })
			.setThumbnail(CdnUrls.RevolvingHeartTwemoji)
			.setDescription(description);
		return send(message, { embeds: [embed] });
	}
}

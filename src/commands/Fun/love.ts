import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { CdnUrls } from '#lib/types/Constants';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed, User } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Fun.LoveDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Fun.LoveExtended),
	requiredPermissions: ['EMBED_LINKS'],
	spam: true,
	usage: '<user:username>'
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [user]: [User]) {
		const isSelf = message.author.id === user.id;
		const percentage = isSelf ? 1 : Math.random();
		const estimatedPercentage = Math.ceil(percentage * 100);

		let result: string | undefined = undefined;
		const language = await message.fetchLanguage();

		if (estimatedPercentage < 45) {
			result = language.get(LanguageKeys.Commands.Fun.LoveLess45);
		} else if (estimatedPercentage < 75) {
			result = language.get(LanguageKeys.Commands.Fun.LoveLess75);
		} else if (estimatedPercentage < 100) {
			result = language.get(LanguageKeys.Commands.Fun.LoveLess100);
		} else {
			result = language.get(isSelf ? LanguageKeys.Commands.Fun.LoveItself : LanguageKeys.Commands.Fun.Love100);
		}

		return message.send(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setAuthor('❤ Love Meter ❤', message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
				.setThumbnail(CdnUrls.RevolvingHeartTwemoji)
				.setDescription(
					[
						`💗 **${user.tag}**`,
						`💗 **${message.author.tag}**\n`,
						`${estimatedPercentage}% \`[${'█'.repeat(Math.round(percentage * 40)).padEnd(40, '\u00A0')}]\`\n`,
						`**${language.get(LanguageKeys.Commands.Fun.LoveResult)}**: ${result}`
					].join('\n')
				)
		);
	}
}

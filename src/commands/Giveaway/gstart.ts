import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { GuildMessage } from '@lib/types';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { Time } from '@utils/constants';
import { TextChannel } from 'discord.js';

const kWinnersArgRegex = /^([1-9]|\d\d+)w$/i;

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['giveaway'],
	description: (language) => language.get(LanguageKeys.Commands.Giveaway.GiveawayDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Giveaway.GiveawayExtended),
	requiredPermissions: ['EMBED_LINKS', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
	runIn: ['text'],
	usage: '[channel:textchannelname{2}] <time:time> [winners:winners] <title:...string{,256}>',
	flagSupport: true,
	usageDelim: ' '
})
@CreateResolvers([
	[
		'winners',
		(arg) => {
			const match = kWinnersArgRegex.exec(arg);
			if (match) return parseInt(match[1], 10);
			throw 'Invalid winners value.';
		}
	]
])
export default class extends SkyraCommand {
	public async run(message: GuildMessage, [channel = message.channel as TextChannel, time, winners, title]: [TextChannel, Date, number, string]) {
		const offset = time.getTime() - Date.now();

		if (offset < 9500) throw await message.fetchLocale(LanguageKeys.Giveaway.Time);
		if (offset > Time.Year) throw await message.fetchLocale(LanguageKeys.Giveaway.TimeTooLong);
		if (winners > 25) winners = 25;

		await this.client.giveaways.create({
			channelID: channel.id,
			endsAt: new Date(time.getTime() + 500),
			guildID: message.guild!.id,
			minimum: 1,
			minimumWinners: winners,
			title
		});
	}
}

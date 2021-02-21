import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { Time } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Identifiers } from '@sapphire/framework';
import { Permissions, TextChannel } from 'discord.js';

const kWinnersArgRegex = /^([1-9]|\d\d+)w$/i;
const options = ['winners'];

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['giveaway'],
	description: LanguageKeys.Commands.Giveaway.GiveawayDescription,
	extendedHelp: LanguageKeys.Commands.Giveaway.GiveawayExtended,
	runIn: ['text'],
	strategyOptions: { options }
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const channel = await args.pick('textChannelName').catch(() => message.channel as TextChannel);
		const missing = channel.permissionsFor(channel.guild.me!)!.missing(UserCommand.requiredPermissions);
		if (missing.length > 0) this.error(Identifiers.PreconditionPermissions, { missing });

		const time = await args.pick('time');
		const offset = time.getTime() - Date.now();
		if (offset < 9500) this.error(LanguageKeys.Giveaway.Time);
		if (offset > Time.Year) this.error(LanguageKeys.Giveaway.TimeTooLong);

		const winners = Math.min(await args.pick(UserCommand.winners).catch(() => parseInt(args.getOption('winners') ?? '1', 10)), 25);
		const title = await args.rest('string', { maximum: 256 });

		await this.context.client.giveaways.create({
			channelID: channel.id,
			endsAt: new Date(time.getTime() + 500),
			guildID: message.guild.id,
			minimum: 1,
			minimumWinners: winners,
			title
		});
	}

	private static winners = Args.make<number>((parameter, { argument }) => {
		const match = kWinnersArgRegex.exec(parameter);
		return match ? Args.ok(parseInt(match[1], 10)) : Args.error({ parameter, argument, identifier: LanguageKeys.Arguments.Winners });
	});

	private static requiredPermissions = new Permissions([
		Permissions.FLAGS.ADD_REACTIONS,
		Permissions.FLAGS.EMBED_LINKS,
		Permissions.FLAGS.READ_MESSAGE_HISTORY,
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.VIEW_CHANNEL
	]);
}

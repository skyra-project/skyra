import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { seconds } from '#utils/common';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, IArgument, Identifiers } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { Permissions, TextChannel } from 'discord.js';

const kWinnersArgRegex = /^(\d+)w$/i;
const options = ['winners'];

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['giveaway'],
	description: LanguageKeys.Commands.Giveaway.GiveawayDescription,
	extendedHelp: LanguageKeys.Commands.Giveaway.GiveawayExtended,
	options,
	runIn: ['GUILD_ANY']
})
export class UserCommand extends SkyraCommand {
	private get integer(): IArgument<number> {
		return this.container.stores.get('arguments').get('integer') as IArgument<number>;
	}

	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const channel = await args.pick('textChannelName').catch(() => message.channel as TextChannel);
		const missing = channel.permissionsFor(channel.guild.me!)!.missing(UserCommand.requiredPermissions);
		if (missing.length > 0) this.error(Identifiers.PreconditionPermissions, { missing });

		const allowedRoles = await this.getAllowedRoles(args);
		const time = await args.pick('time');
		const offset = time.getTime() - Date.now();
		if (offset < seconds(9.5)) this.error(LanguageKeys.Giveaway.Time);
		if (offset > Time.Year) this.error(LanguageKeys.Giveaway.TimeTooLong);

		const winners = await this.getWinners(args);
		const title = await args.rest('string', { maximum: 256 });

		await this.container.client.giveaways.create({
			allowedRoles,
			channelId: channel.id,
			endsAt: new Date(time.getTime() + 500),
			guildId: message.guild.id,
			minimum: 1,
			minimumWinners: winners,
			title
		});
	}

	private async getAllowedRoles(args: SkyraCommand.Args): Promise<string[]> {
		try {
			const roles = await args.repeat('roleName');
			return roles.map((role) => role.id);
		} catch {
			return [];
		}
	}

	private async getWinners(args: SkyraCommand.Args) {
		const argumentResult = await args.pickResult(UserCommand.winners);
		if (argumentResult.success) return argumentResult.value;
		if (argumentResult.error.identifier !== LanguageKeys.Arguments.Winners) throw argumentResult.error;

		const parameter = args.getOption('winners');
		if (parameter === null) return 1;

		const argument = this.integer;
		const optionResult = await argument.run(parameter, {
			args,
			argument,
			command: this,
			commandContext: args.commandContext,
			message: args.message,
			minimum: 1,
			maximum: 20
		});
		if (optionResult.success) return optionResult.value;
		throw optionResult.error;
	}

	private static winners = Args.make<number>((parameter, { argument }) => {
		const match = kWinnersArgRegex.exec(parameter);
		if (match === null) return Args.error({ parameter, argument, identifier: LanguageKeys.Arguments.Winners });

		const parsed = parseInt(match[1], 10);
		if (parsed < 1) return Args.error({ parameter, argument, identifier: LanguageKeys.Arguments.TooFewWinners });
		if (parsed > 20) return Args.error({ parameter, argument, identifier: LanguageKeys.Arguments.TooManyWinners });
		return Args.ok(parsed);
	});

	private static requiredPermissions = new Permissions([
		Permissions.FLAGS.ADD_REACTIONS,
		Permissions.FLAGS.EMBED_LINKS,
		Permissions.FLAGS.READ_MESSAGE_HISTORY,
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.VIEW_CHANNEL
	]);
}

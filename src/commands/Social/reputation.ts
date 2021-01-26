import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { Time } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['rep'],
	bucket: 2,
	cooldown: 30,
	description: LanguageKeys.Commands.Social.ReputationDescription,
	extendedHelp: LanguageKeys.Commands.Social.ReputationExtended,
	runIn: ['text'],
	spam: true
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const check = args.finished ? false : await args.pick(UserCommand.check).catch(() => false);
		const user = args.finished ? message.author : await args.pick('userName');

		const date = new Date();
		const now = date.getTime();

		const { users } = await DbSet.connect();
		const selfSettings = await users.ensureProfileAndCooldowns(message.author.id);
		const extSettings = user ? await users.ensureProfile(user.id) : null;

		if (check) {
			if (user.bot) throw args.t(LanguageKeys.Commands.Social.ReputationsBots);
			const reputationPoints = args.t(LanguageKeys.Commands.Social.Reputation, { count: extSettings!.reputations });
			return message.send(
				message.author === user
					? args.t(LanguageKeys.Commands.Social.ReputationsSelf, { points: selfSettings.reputations })
					: args.t(LanguageKeys.Commands.Social.Reputations, { user: user.username, points: reputationPoints })
			);
		}

		const timeReputation = selfSettings.cooldowns.reputation?.getTime();

		if (timeReputation && timeReputation + Time.Day > now) {
			return message.send(args.t(LanguageKeys.Commands.Social.ReputationTime, { remaining: timeReputation + Time.Day - now }));
		}

		if (!user) return message.send(args.t(LanguageKeys.Commands.Social.ReputationUsable));
		if (user.bot) throw args.t(LanguageKeys.Commands.Social.ReputationsBots);
		if (user === message.author) throw args.t(LanguageKeys.Commands.Social.ReputationSelf);

		await users.manager.transaction(async (em) => {
			++extSettings!.reputations;
			selfSettings.cooldowns.reputation = date;
			await em.save([extSettings, selfSettings]);
		});

		return message.send(args.t(LanguageKeys.Commands.Social.ReputationGive, { user: user.toString() }));
	}

	private static check = Args.make<boolean>((parameter, { argument }) => {
		if (parameter.toLowerCase() === 'check') return Args.ok(true);
		return Args.error({ argument, parameter });
	});
}

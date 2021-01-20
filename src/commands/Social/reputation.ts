import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { Time } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { CreateResolver } from '@skyra/decorators';
import type { User } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['rep'],
	bucket: 2,
	cooldown: 30,
	description: LanguageKeys.Commands.Social.ReputationDescription,
	extendedHelp: LanguageKeys.Commands.Social.ReputationExtended,
	runIn: ['text'],
	spam: true,
	usage: '[check] (user:username)',
	usageDelim: ' '
})
@CreateResolver('username', (arg, possible, message, [check]) => {
	if (!arg) return check ? message.author : undefined;
	return message.client.arguments.get('username')!.run(arg, possible, message);
})
export default class extends SkyraCommand {
	public async run(message: GuildMessage, [check, user]: ['check', User]) {
		const date = new Date();
		const now = date.getTime();

		const { users } = await DbSet.connect();
		const selfSettings = await users.ensureProfileAndCooldowns(message.author.id);
		const extSettings = user ? await users.ensureProfile(user.id) : null;
		const t = await message.fetchT();

		if (check) {
			if (user.bot) throw t(LanguageKeys.Commands.Social.ReputationsBots);
			const reputationPoints = t(LanguageKeys.Commands.Social.Reputation, { count: extSettings!.reputations });
			return message.send(
				message.author === user
					? t(LanguageKeys.Commands.Social.ReputationsSelf, { points: selfSettings.reputations })
					: t(LanguageKeys.Commands.Social.Reputations, { user: user.username, points: reputationPoints })
			);
		}

		const timeReputation = selfSettings.cooldowns.reputation?.getTime();

		if (timeReputation && timeReputation + Time.Day > now) {
			return message.sendTranslated(LanguageKeys.Commands.Social.ReputationTime, [{ remaining: timeReputation + Time.Day - now }]);
		}

		if (!user) return message.sendTranslated(LanguageKeys.Commands.Social.ReputationUsable);
		if (user.bot) throw t(LanguageKeys.Commands.Social.ReputationsBots);
		if (user === message.author) throw t(LanguageKeys.Commands.Social.ReputationSelf);

		await users.manager.transaction(async (em) => {
			++extSettings!.reputations;
			selfSettings.cooldowns.reputation = date;
			await em.save([extSettings, selfSettings]);
		});

		return message.sendTranslated(LanguageKeys.Commands.Social.ReputationGive, [{ user: user.toString() }]);
	}
}

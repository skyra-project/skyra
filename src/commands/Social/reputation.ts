import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Time } from '@utils/constants';
import { User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { getManager } from 'typeorm';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['rep'],
			bucket: 2,
			cooldown: 30,
			description: (language) => language.get(LanguageKeys.Commands.Social.ReputationDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Social.ReputationExtended),
			runIn: ['text'],
			spam: true,
			usage: '[check] (user:username)',
			usageDelim: ' '
		});

		this.createCustomResolver('username', (arg, possible, msg, [check]) => {
			if (!arg) return check ? msg.author : undefined;
			return this.client.arguments.get('username')!.run(arg, possible, msg);
		});
	}

	public async run(message: KlasaMessage, [check, user]: ['check', User]) {
		const date = new Date();
		const now = date.getTime();

		const { users } = await DbSet.connect();
		const selfSettings = await users.ensureProfileAndCooldowns(message.author.id);
		const extSettings = user ? await users.ensureProfile(user.id) : null;

		if (check) {
			if (user.bot) throw message.language.get(LanguageKeys.Commands.Social.ReputationsBots);
			// TODO: i18next should do this automatically
			const reputationPoints =
				extSettings!.reputations === 1
					? message.language.get(LanguageKeys.Commands.Social.Reputation, { count: extSettings!.reputations })
					: message.language.get(LanguageKeys.Commands.Social.ReputationPlural, { count: extSettings!.reputations });
			return message.sendMessage(
				message.author === user
					? message.language.get(LanguageKeys.Commands.Social.ReputationsSelf, { points: selfSettings.reputations })
					: message.language.get(LanguageKeys.Commands.Social.Reputations, { user: user.username, points: reputationPoints })
			);
		}

		const timeReputation = selfSettings.cooldowns.reputation?.getTime();

		if (timeReputation && timeReputation + Time.Day > now) {
			return message.sendLocale(LanguageKeys.Commands.Social.ReputationTime, [{ remaining: timeReputation + Time.Day - now }]);
		}

		if (!user) return message.sendLocale(LanguageKeys.Commands.Social.ReputationUsable);
		if (user.bot) throw message.language.get(LanguageKeys.Commands.Social.ReputationsBots);
		if (user === message.author) throw message.language.get(LanguageKeys.Commands.Social.ReputationSelf);

		await getManager().transaction(async (em) => {
			++extSettings!.reputations;
			selfSettings.cooldowns.reputation = date;
			await em.save([extSettings, selfSettings]);
		});

		return message.sendLocale(LanguageKeys.Commands.Social.ReputationGive, [{ user: user.toString() }]);
	}
}

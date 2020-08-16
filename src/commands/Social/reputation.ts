import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
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
			description: (language) => language.tget('COMMAND_REPUTATION_DESCRIPTION'),
			extendedHelp: (language) => language.tget('COMMAND_REPUTATION_EXTENDED'),
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
			if (user.bot) throw message.language.tget('COMMAND_REPUTATION_BOTS');
			return message.sendMessage(
				message.author === user
					? message.language.tget('COMMAND_REPUTATIONS_SELF', selfSettings.reputations)
					: message.language.tget('COMMAND_REPUTATIONS', user.username, extSettings!.reputations)
			);
		}

		const timeReputation = selfSettings.cooldowns.reputation?.getTime();

		if (timeReputation && timeReputation + Time.Day > now) {
			return message.sendLocale('COMMAND_REPUTATION_TIME', [timeReputation + Time.Day - now]);
		}

		if (!user) return message.sendLocale('COMMAND_REPUTATION_USABLE');
		if (user.bot) throw message.language.tget('COMMAND_REPUTATION_BOTS');
		if (user === message.author) throw message.language.tget('COMMAND_REPUTATION_SELF');

		await getManager().transaction(async (em) => {
			++extSettings!.reputations;
			selfSettings.cooldowns.reputation = date;
			await em.save([extSettings, selfSettings]);
		});

		return message.sendLocale('COMMAND_REPUTATION_GIVE', [user]);
	}
}

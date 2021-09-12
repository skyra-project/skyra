import type { ClientEntity, DbSet, UserEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { Schedules } from '#lib/types/Enums';
import { hours, seconds } from '#utils/common';
import { promptConfirmation } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';
import type { TFunction } from 'i18next';

const GRACE_PERIOD = hours(1);
const DAILY_PERIOD = hours(12);

const REMINDER_FLAGS = ['remind', 'reminder', 'remindme'];

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['dailies'],
	cooldownDelay: seconds(30),
	description: LanguageKeys.Commands.Social.DailyDescription,
	detailedDescription: LanguageKeys.Commands.Social.DailyExtended,
	spam: true,
	flags: REMINDER_FLAGS
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const toRemind = args.getFlags(...REMINDER_FLAGS);
		const now = Date.now();

		const connection = this.container.db;
		return connection.users.lock([message.author.id], async (id) => {
			const settings = await connection.users.ensureCooldowns(id);

			// It's been 12 hours, grant dailies
			if (!settings.cooldowns.daily || settings.cooldowns.daily.getTime() <= now) {
				const content = args.t(LanguageKeys.Commands.Social.DailyTimeSuccess, {
					amount: await this.claimDaily(message, args.t, connection, settings, now + DAILY_PERIOD, toRemind)
				});
				return send(message, content);
			}

			const remaining = settings.cooldowns.daily.getTime() - now;

			// If it's not under the grace period (1 hour), tell them the time
			if (remaining > GRACE_PERIOD) {
				const content = args.t(LanguageKeys.Commands.Social.DailyTime, { time: remaining });
				return send(message, content);
			}

			// It's been 11-12 hours, ask for the user if they want to claim the grace period
			const accepted = await promptConfirmation(message, args.t(LanguageKeys.Commands.Social.DailyGrace, { remaining }));
			if (!accepted) {
				const content = args.t(LanguageKeys.Commands.Social.DailyGraceDenied);
				return send(message, content);
			}

			// The user accepted the grace period
			const content = args.t(LanguageKeys.Commands.Social.DailyGraceAccepted, {
				amount: await this.claimDaily(message, args.t, connection, settings, now + remaining + DAILY_PERIOD, toRemind),
				remaining: remaining + DAILY_PERIOD
			});
			return send(message, content);
		});
	}

	private async claimDaily(message: Message, t: TFunction, connection: DbSet, settings: UserEntity, nextTime: number, remind: boolean) {
		const money = this.calculateDailies(message, await connection.clients.ensure(), settings);

		settings.money += money;
		settings.cooldowns!.daily = new Date(nextTime);
		await settings.save();

		if (remind) {
			await this.container.schedule.add(Schedules.Reminder, nextTime, {
				data: {
					content: t(LanguageKeys.Commands.Social.DailyCollect),
					user: message.author.id
				}
			});
		}

		return money;
	}

	private calculateDailies(message: Message, client: ClientEntity, user: UserEntity) {
		let money = 200;
		if (client.userBoost.includes(user.id)) money *= 1.5;
		if (message.guild && client.guildBoost.includes(message.guild.id)) money *= 1.5;
		return money;
	}
}

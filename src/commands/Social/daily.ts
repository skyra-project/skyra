import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ClientEntity } from '@orm/entities/ClientEntity';
import { UserEntity } from '@orm/entities/UserEntity';
import { ApplyOptions } from '@skyra/decorators';
import { Time } from '@utils/constants';
import { KlasaMessage } from 'klasa';

const GRACE_PERIOD = Time.Hour;
const DAILY_PERIOD = Time.Hour * 12;

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['dailies'],
	cooldown: 30,
	description: (language) => language.get('COMMAND_DAILY_DESCRIPTION'),
	extendedHelp: (language) => language.get('COMMAND_DAILY_EXTENDED'),
	spam: true
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage) {
		const now = Date.now();

		const connection = await DbSet.connect();
		return connection.users.lock([message.author.id], async (id) => {
			const settings = await connection.users.ensureCooldowns(id);

			// It's been 12 hours, grant dailies
			if (!settings.cooldowns.daily || settings.cooldowns.daily.getTime() <= now) {
				return message.sendLocale('COMMAND_DAILY_TIME_SUCCESS', [
					{
						amount: await this.claimDaily(message, connection, settings, now + DAILY_PERIOD)
					}
				]);
			}

			const remaining = settings.cooldowns.daily.getTime() - now;

			// If it's not under the grace period (1 hour), tell them the time
			if (remaining > GRACE_PERIOD) return message.sendLocale('COMMAND_DAILY_TIME', [{ time: remaining }]);

			// It's been 11-12 hours, ask for the user if they want to claim the grace period
			const accepted = await message.ask(message.language.get('COMMAND_DAILY_GRACE', { remaining }));
			if (!accepted) return message.sendLocale('COMMAND_DAILY_GRACE_DENIED');

			// The user accepted the grace period
			return message.sendLocale('COMMAND_DAILY_GRACE_ACCEPTED', [
				{
					amount: await this.claimDaily(message, connection, settings, now + remaining + DAILY_PERIOD),
					remaining: remaining + DAILY_PERIOD
				}
			]);
		});
	}

	private async claimDaily(message: KlasaMessage, connection: DbSet, settings: UserEntity, nextTime: number) {
		const money = this.calculateDailies(message, await connection.clients.ensure(), settings);

		settings.money += money;
		settings.cooldowns!.daily = new Date(nextTime);
		await settings.save();

		return money;
	}

	private calculateDailies(message: KlasaMessage, client: ClientEntity, user: UserEntity) {
		let money = 200;
		if (client.userBoost.includes(user.id)) money *= 1.5;
		if (message.guild && client.guildBoost.includes(message.guild.id)) money *= 1.5;
		return money;
	}
}

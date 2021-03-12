import { SkyraCommand } from '#lib/structures';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplyOptions } from '@sapphire/decorators';
import { nextBirthday } from '#utils/util';
import { Time } from '@sapphire/time-utilities';
import { Birthday } from '#lib/database/keys/settings/All';
import { GuildMessage } from '#lib/types';
import { CommandContext } from '@sapphire/framework';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 10,
	description: LanguageKeys.Commands.Misc.SetBirthdayDescription,
	extendedHelp: LanguageKeys.Commands.Misc.SetBirthdayExtended,
	runIn: ['text']
})
export default class extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args, context: CommandContext) {
		const { t } = args;
		const [birthdayRole, birthdayChannel, birthdayMessage] = await message.guild.readSettings([
			Birthday.Role,
			Birthday.Channel,
			Birthday.Message
		]);
		if (!birthdayRole && !(birthdayChannel && birthdayMessage))
			return this.error(LanguageKeys.Commands.Misc.SetBirthdayNotConfigured, { prefix: context.commandPrefix });

		const birthDate = await args.rest('date');
		birthDate.setTime(birthDate.getTime() - birthDate.getTimezoneOffset() * Time.Minute);
		// bounds checking
		// the world's oldest human alive was born in January 1903
		if (birthDate.getTime() > Date.now() || birthDate.getFullYear() < 1903) return this.error(LanguageKeys.Commands.Misc.SetBirthdayInvalidDate);
		// delete any existing reminders
		const currentTask = this.context.client.schedules.queue.find(
			(schedule) => schedule.taskID === 'birthday' && schedule.data.guildID === message.guild.id && schedule.data.userID === message.author.id
		);
		if (currentTask) await this.context.client.schedules.remove(currentTask);

		const birthday = nextBirthday(birthDate);
		await this.context.client.schedules.add('birthday', birthday, {
			data: {
				birthDate,
				guildID: message.guild.id,
				userID: message.author.id
			}
		});
		return message.send(t(LanguageKeys.Commands.Misc.SetBirthdaySuccess, { nextBirthday: birthday.getTime() }));
	}
}

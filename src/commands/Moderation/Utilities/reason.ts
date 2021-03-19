import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { Events, PermissionLevels } from '#lib/types/Enums';
import { getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 5,
	description: LanguageKeys.Commands.Moderation.ReasonDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.ReasonExtended,
	permissionLevel: PermissionLevels.Moderator,
	permissions: ['EMBED_LINKS'],
	runIn: ['text']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const cases = await args
			.pick('case')
			.then((value) => [value])
			.catch(() => args.pick('range', { maximum: 50 }));

		const entries = await message.guild.moderation.fetch(cases);
		if (!entries.size) {
			this.error(LanguageKeys.Commands.Moderation.ModerationCaseNotExists, { count: cases.length });
		}

		const reason = await args.rest('string');
		const imageURL = getImage(message);
		const { moderations } = this.context.db;
		await moderations
			.createQueryBuilder()
			.update()
			.where('guild_id = :guild', { guild: message.guild.id })
			.andWhere('case_id IN (:...ids)', { ids: [...entries.keys()] })
			.set({ reason, imageURL })
			.execute();
		await message.guild.moderation.fetchChannelMessages();
		for (const entry of entries.values()) {
			const clone = entry.clone();
			entry.setReason(reason).setImageURL(imageURL);
			this.context.client.emit(Events.ModerationEntryEdit, clone, entry);
		}

		return message.alert(
			args
				.t(LanguageKeys.Commands.Moderation.ReasonUpdated, {
					entries: cases,
					newReason: reason,
					count: cases.length
				})
				.join('\n')
		);
	}
}

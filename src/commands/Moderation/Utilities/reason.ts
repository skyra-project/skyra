import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { Events, PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { getImage } from '@utils/util';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 5,
	description: (language) => language.get(LanguageKeys.Commands.Moderation.ReasonDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Moderation.ReasonExtended),
	permissionLevel: PermissionLevels.Moderator,
	requiredPermissions: ['EMBED_LINKS'],
	runIn: ['text'],
	usage: '<range:range{,50}> <reason:...string>',
	usageDelim: ' '
})
export default class extends SkyraCommand {
	public async init() {
		this.createCustomResolver('range', async (arg, possible, message) => {
			if (arg === 'latest') return [await message.guild!.moderation.count()];
			return this.client.arguments.get('range')!.run(arg, possible, message);
		});
	}

	public async run(message: KlasaMessage, [cases, reason]: [number[], string]) {
		const entries = await message.guild!.moderation.fetch(cases);
		if (!entries.size)
			throw message.language.get(
				cases.length === 1
					? LanguageKeys.Commands.Moderation.ModerationCaseNotExists
					: LanguageKeys.Commands.Moderation.ModerationCasesNotExist
			);

		const imageURL = getImage(message);
		const { moderations } = await DbSet.connect();
		await moderations
			.createQueryBuilder()
			.update()
			.where('guild_id = :guild', { guild: message.guild!.id })
			.andWhere('case_id IN (:...ids)', { ids: [...entries.keys()] })
			.set({ reason, imageURL })
			.execute();
		await message.guild!.moderation.fetchChannelMessages();
		for (const entry of entries.values()) {
			const clone = entry.clone();
			entry.setReason(reason).setImageURL(imageURL);
			this.client.emit(Events.ModerationEntryEdit, clone, entry);
		}

		return message.alert(
			message.language
				.get(cases.length === 1 ? LanguageKeys.Commands.Moderation.ReasonUpdated : LanguageKeys.Commands.Moderation.ReasonUpdatedPlural, {
					entries: cases,
					newReason: reason,
					count: cases.length
				})
				.join('\n')
		);
	}
}

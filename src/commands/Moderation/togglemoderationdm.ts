import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['togglemdm', 'togglemoddm', 'tmdm'],
	cooldown: 10,
	description: (language) => language.get('COMMAND_TOGGLEMODERATIONDM_DESCRIPTION'),
	extendedHelp: (language) => language.get('COMMAND_TOGGLEMODERATIONDM_EXTENDED')
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage) {
		const { users } = await DbSet.connect();
		const updated = await users.lock([message.author.id], async (id) => {
			const user = await users.ensure(id);

			user.moderationDM = !user.moderationDM;
			return user.save();
		});

		return message.sendLocale('COMMAND_TOGGLEMODERATIONDM_TOGGLED', [updated.moderationDM]);
	}
}

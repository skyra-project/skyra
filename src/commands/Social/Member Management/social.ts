import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: language => language.tget('COMMAND_SOCIAL_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_SOCIAL_EXTENDED'),
			permissionLevel: 6,
			runIn: ['text'],
			subcommands: true,
			usage: '<add|remove|set|reset> <user:username> (amount:money{0,1000000})',
			usageDelim: ' '
		});

		this.createCustomResolver('money', (arg, possible, message, [type]) => {
			if (type === 'reset') return null;
			return this.client.arguments.get('integer').run(arg, possible, message);
		});
	}

	public async add(message: KlasaMessage, [user, amount]: [KlasaUser, number]) {
		const newAmount = await this.client.queries.upsertIncrementMemberSettings(message.guild!.id, user.id, amount);
		return message.sendLocale('COMMAND_SOCIAL_ADD', [user.username, newAmount, amount]);
	}

	public async remove(message: KlasaMessage, [user, amount]: [KlasaUser, number]) {
		const newAmount = await this.client.queries.upsertDecrementMemberSettings(message.guild!.id, user.id, amount);
		return message.sendLocale('COMMAND_SOCIAL_REMOVE', [user.username, newAmount, amount]);
	}

	public async set(message: KlasaMessage, [user, amount]: [KlasaUser, number]) {
		// If sets to zero, it shall reset
		if (amount === 0) return this.reset(message, [user]);

		const updated = await this.client.queries.upsertMemberSettingsDifference(message.guild!.id, user.id, amount);
		const variation = updated.new_value - (updated.old_value || 0);
		if (variation === 0) return message.sendLocale('COMMAND_SOCIAL_UNCHANGED', [user.username]);
		return message.sendLocale(variation > 0
			? 'COMMAND_SOCIAL_ADD'
			: 'COMMAND_SOCIAL_REMOVE', [user.username, updated.new_value, Math.abs(variation)]);
	}

	public async reset(message: KlasaMessage, [user]: [KlasaUser]) {
		await this.client.queries.deleteMemberSettings(message.guild!.id, user.id);
		return message.sendLocale('COMMAND_SOCIAL_RESET', [user.username]);
	}

}

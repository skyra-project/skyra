import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { Databases } from '../../../lib/types/constants/Constants';
import { MemberSettings } from '../../../lib/types/settings/MemberSettings';

interface DatabaseMemberSchema {
	id: string;
	count: number;
}

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
		let newAmount;
		const member = await message.guild!.members.fetch(user.id).catch(() => null);
		if (member) {
			// Update from SettingsGateway
			await member.settings.sync();
			newAmount = member.settings.get(MemberSettings.Points) + amount;
			await member.settings.update(newAmount);
		} else {
			const entry = await this._getMemberSettings(message.guild!.id, user.id);
			if (!entry) throw message.language.tget('COMMAND_SOCIAL_MEMBER_NOTEXISTS');

			// Update from database
			newAmount = (entry.count as number) + amount;
			await this.client.providers.default.db
				.table(Databases.Members)
				.get(entry.id)
				.update({ count: newAmount })
				.run();
		}

		return message.sendLocale('COMMAND_SOCIAL_ADD', [user.username, newAmount, amount]);
	}

	public async remove(message: KlasaMessage, [user, amount]: [KlasaUser, number]) {
		let newAmount;
		const member = await message.guild!.members.fetch(user.id).catch(() => null);
		if (member) {
			// Update from SettingsGateway
			await member.settings.sync();
			newAmount = Math.max(member.settings.get(MemberSettings.Points) - amount, 0);
			await member.settings.update(newAmount);
		} else {
			const entry = await this._getMemberSettings(message.guild!.id, user.id);
			if (!entry) throw message.language.tget('COMMAND_SOCIAL_MEMBER_NOTEXISTS');

			// Update from database
			newAmount = Math.max(entry.count - amount, 0);
			await this.client.providers.default.db
				.table(Databases.Members)
				.get(entry.id)
				.update({ count: newAmount })
				.run();
		}

		return message.sendLocale('COMMAND_SOCIAL_REMOVE', [user.username, newAmount, amount]);
	}

	public async set(message: KlasaMessage, [user, amount]: [KlasaUser, number]) {
		// If sets to zero, it shall reset
		if (amount === 0) return this.reset(message, [user]);

		let variation: number;
		let original: number;
		const member = await message.guild!.members.fetch(user.id).catch(() => null);
		if (member) {
			// Update from SettingsGateway
			await member.settings.sync();
			original = member.settings.get(MemberSettings.Points);
			variation = amount - original;
			if (variation === 0) return message.sendLocale('COMMAND_SOCIAL_UNCHANGED', [user.username]);
			await member.settings.update(MemberSettings.Points, amount);
		} else {
			const entry = await this._getMemberSettings(message.guild!.id, user.id);
			if (!entry) throw message.language.tget('COMMAND_SOCIAL_MEMBER_NOTEXISTS');

			// Update from database
			original = entry.count;
			variation = amount - original;
			if (variation === 0) return message.sendLocale('COMMAND_SOCIAL_UNCHANGED', [user.username]);
			await this.client.providers.default.db
				.table<DatabaseMemberSchema>(Databases.Members)
				.get(entry.id)
				.update({ count: amount })
				.run();
		}

		return message.sendLocale(variation > 0
			? 'COMMAND_SOCIAL_ADD'
			: 'COMMAND_SOCIAL_REMOVE', [user.username, original + variation, Math.abs(variation)]);
	}

	public async reset(message: KlasaMessage, [user]: [KlasaUser]) {
		const member = await message.guild!.members.fetch(user.id).catch(() => null);
		if (member) {
			// Update from SettingsGateway
			await member.settings.sync();
			await member.settings.reset(MemberSettings.Points);
		} else {
			const entry = await this._getMemberSettings(message.guild!.id, user.id);
			if (!entry) throw message.language.tget('COMMAND_SOCIAL_MEMBER_NOTEXISTS');

			// Update from database
			await this.client.providers.default.db
				.table<DatabaseMemberSchema>(Databases.Members)
				.get(entry.id)
				.update({ count: 0 })
				.run();
		}

		return message.sendLocale('COMMAND_SOCIAL_RESET', [user.username]);
	}

	public _getMemberSettings(guildID: string, userID: string) {
		return this.client.providers.default.db
			.table(Databases.Members)
			.getAll([guildID, userID], { index: 'guild_user' })
			.limit(1)
			.nth(0)
			.default(null)
			.run();
	}

}

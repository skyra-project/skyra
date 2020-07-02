import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { MemberEntity } from '@orm/entities/MemberEntity';
import { Time } from '@utils/constants';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: language => language.tget('COMMAND_SOCIAL_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_SOCIAL_EXTENDED'),
			permissionLevel: PermissionLevels.Administrator,
			runIn: ['text'],
			subcommands: true,
			usage: '<add|remove|set|reset> <user:username> (amount:money{0,1000000})',
			usageDelim: ' '
		});

		this.createCustomResolver('money', (arg, possible, message, [type]) => {
			if (type === 'reset') return null;
			return this.client.arguments.get('integer')!.run(arg, possible, message);
		});
	}

	public async add(message: KlasaMessage, [user, amount]: [KlasaUser, number]) {
		const { members } = await DbSet.connect();
		const settings = await members.findOne({ where: { userID: user.id, guildID: message.guild!.id }, cache: Time.Minute * 15 });
		if (settings) {
			const newAmount = Number(settings.points) + amount;
			settings.points = newAmount;
			await settings.save();

			return message.sendLocale('COMMAND_SOCIAL_ADD', [user.username, newAmount, amount]);
		}

		const created = new MemberEntity();
		created.userID = user.id;
		created.guildID = message.guild!.id;
		created.points = amount;
		await members.insert(created);

		return message.sendLocale('COMMAND_SOCIAL_ADD', [user.username, amount, amount]);
	}

	public async remove(message: KlasaMessage, [user, amount]: [KlasaUser, number]) {
		const connection = await DbSet.connect();
		const settings = await connection.members.findOne({ where: { userID: user.id, guildID: message.guild!.id }, cache: Time.Minute * 15 });
		if (!settings) throw message.language.tget('COMMAND_SOCIAL_MEMBER_NOTEXISTS');

		const newAmount = Math.max(Number(settings.points) - amount, 0);
		settings.points = newAmount;
		await settings.save();

		return message.sendLocale('COMMAND_SOCIAL_REMOVE', [user.username, newAmount, amount]);
	}

	public async set(message: KlasaMessage, [user, amount]: [KlasaUser, number]) {
		// If sets to zero, it shall reset
		if (amount === 0) return this.reset(message, [user]);

		const connection = await DbSet.connect();
		const settings = await connection.members.findOne({ where: { userID: user.id, guildID: message.guild!.id }, cache: Time.Minute * 15 });
		let oldValue = 0;
		if (settings) {
			oldValue = Number(settings.points);
			settings.points = amount;
			await settings.save();
		} else {
			const created = new MemberEntity();
			created.userID = user.id;
			created.guildID = message.guild!.id;
			created.points = amount;
			await connection.members.insert(created);
		}

		const variation = amount - oldValue;
		if (variation === 0) return message.sendLocale('COMMAND_SOCIAL_UNCHANGED', [user.username]);
		return message.sendLocale(variation > 0
			? 'COMMAND_SOCIAL_ADD'
			: 'COMMAND_SOCIAL_REMOVE', [user.username, amount, Math.abs(variation)]);
	}

	public async reset(message: KlasaMessage, [user]: [KlasaUser]) {
		await (await DbSet.connect()).members.delete({ userID: user.id, guildID: message.guild!.id });
		return message.sendLocale('COMMAND_SOCIAL_RESET', [user.username]);
	}

}

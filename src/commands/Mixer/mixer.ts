import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { MixerExpandedChannel } from '@lib/types/definitions/Mixer';
import * as Limiter from '@utils/ClassRateLimiter';
import { Time } from '@utils/constants';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			// TODO(quantumlytangled): Language key
			description: 'Gets a Mixer users data',
			// TODO(quantumlytangled): Language key
			extendedHelp: 'Gets a Mixer users data',
			runIn: ['text'],
			usage: '<name:string>'
		});
	}

	public async run(message: KlasaMessage, [name]: [string]) {
		const users = await this.client.mixer.findUsersWithChannel(name);
		// TODO(quantumlytangled): Language key
		if (users.length === 0) throw 'No user found';
		let user = await this.client.mixer.fetchChannelByID(users[0].id);
		// TODO(quantumlytangled): Language key
		if ((user as Limiter.MethodLimitError).remainingTime) throw `Sorry we have reached our limit, please wait ${(user as Limiter.MethodLimitError).remainingTime / Time.Second} second`;
		user = user as MixerExpandedChannel;
		const embed = new MessageEmbed()
			.setColor(0x1FBAED)
			.setAuthor(user.name, 'https://raw.githubusercontent.com/mixer/branding-kit/master/png/MixerMerge_Light.png')
			// TODO(quantumlytangled): Language key
			.addField('Level', user.user.level, true)
			// TODO(quantumlytangled): Language key
			.addField('Experience', user.user.experience, true)
			// TODO(quantumlytangled): Language key
			.addField('Audience', user.audience)
			// TODO(quantumlytangled): Language key
			.addField('Total Viewers', user.viewersTotal)
			// TODO(quantumlytangled): Language key
			.addField('Follower Number', user.numFollowers)
			.setTimestamp(new Date(user.createdAt).getTime());
		return message.sendEmbed(embed);
	}

}

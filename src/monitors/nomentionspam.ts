// Copyright (c) 2018 BDISTIN. All rights reserved. MIT license.
import { KlasaMessage, Monitor } from 'klasa';
import { Events } from '../lib/types/Enums';
import { GuildSettings } from '../lib/types/settings/GuildSettings';

export default class extends Monitor {

	private readonly roleValue = this.client.options.nms.role!;
	private readonly everyoneValue = this.client.options.nms.everyone!;

	public run(message: KlasaMessage) {
		if (!message.guild || !message.guild.settings.get(GuildSettings.NoMentionSpam.Enabled)) return;

		const mentions = message.mentions.users.filter(user => !user.bot && user !== message.author).size +
			(message.mentions.roles.size * this.roleValue) +
			(Number(message.mentions.everyone) * this.everyoneValue);

		if (!mentions) return;

		const rateLimit = message.guild.security.nms.acquire(message.author.id);

		try {
			for (let i = 0; i < mentions; i++) rateLimit.drip();
			// Reset time, don't let them relax
			rateLimit.resetTime();
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore 2341
			if (message.guild.settings.get(GuildSettings.NoMentionSpam.Alerts) && rateLimit.remaining / rateLimit.bucket < 0.2) {
				this.client.emit(Events.MentionSpamWarning, message);
			}
		} catch (err) {
			this.client.emit(Events.MentionSpamExceeded, message);
		}
	}

}

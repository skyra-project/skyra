
/**
 * @license
 * MIT License
 *
 * Copyright (c) 2017-2018 Kyra
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Util, TextChannel, Channel } from 'discord.js';
import { Task } from 'klasa';
import { Events } from '../lib/types/Enums';

// THRESHOLD equals to 30 minutes in milliseconds:
//     - 1000 milliseconds = 1 second
//     - 60 seconds        = 1 minute
//     - 30 minutes
const THRESHOLD = 1000 * 60 * 30;
const EPOCH = 1420070400000;
const EMPTY = '0000100000000000000000';

// The header with the console colours
const HEADER = `\u001B[39m\u001B[94m[CACHE CLEANUP]\u001B[39m\u001B[90m`;

/**
 * @version 2.0.0
 */
export default class extends Task {

	public run() {
		const OLD_SNOWFLAKE = Util.binaryToID(((Date.now() - THRESHOLD) - EPOCH).toString(2).padStart(42, '0') + EMPTY);
		let presences = 0;
		let guildMembers = 0;
		let emojis = 0;
		let lastMessages = 0;
		let users = 0;

		// Per-Guild sweeper
		for (const guild of this.client.guilds.values()) {
			// Clear presences
			presences += guild.presences.size;
			guild.presences.clear();

			// Clear members that haven't send a message in the last 30 minutes
			const { me } = guild;
			for (const [id, member] of guild!.members) {
				if (member === me) continue;
				if (member.voice.channelID) continue;
				if (member.lastMessageID && member.lastMessageID > OLD_SNOWFLAKE) continue;
				guild.members.delete(id);
				guildMembers++;
			}

			// Clear emojis
			emojis += guild!.emojis.size;
			guild.emojis.clear();
		}

		// Per-Channel sweeper
		for (const channel of this.client.channels.values()) {
			if (this.isTextChannel(channel) && channel.lastMessageID) {
				channel.lastMessageID = null;
				lastMessages++;
			}
		}

		// Per-User sweeper
		for (const user of this.client.users.values()) {
			if (user.lastMessageID && user.lastMessageID > OLD_SNOWFLAKE) continue;
			this.client.users.delete(user.id);
			users++;
		}

		// Emit a log
		this.client.emit(Events.Verbose,
			`${HEADER} ${
				this.setColor(presences)} [Presence]s | ${
				this.setColor(guildMembers)} [GuildMember]s | ${
				this.setColor(users)} [User]s | ${
				this.setColor(emojis)} [Emoji]s | ${
				this.setColor(lastMessages)} [Last Message]s.`);
	}

	/**
	 * Set a color depending on the amount:
	 * > 1000 : Light Red color
	 * > 100  : Light Yellow color
	 * < 100  : Green color
	 * @param n The number to colorise
	 */
	public setColor(n: number) {
		const text = String(n).padStart(5, ' ');
		// Light Red color
		if (n > 1000) return `\u001B[39m\u001B[91m${text}\u001B[39m\u001B[90m`;
		// Light Yellow color
		if (n > 100) return `\u001B[39m\u001B[93m${text}\u001B[39m\u001B[90m`;
		// Green color
		return `\u001B[39m\u001B[32m${text}\u001B[39m\u001B[90m`;
	}

	private isTextChannel(channel: Channel): channel is TextChannel {
		return channel.type === 'text';
	}

}

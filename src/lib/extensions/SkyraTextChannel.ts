import { Message, Permissions, Structures, TextChannel } from 'discord.js';

const snipes = new WeakMap<TextChannel, SnipedMessage>();
const READ_PERMISSIONS = new Permissions(['VIEW_CHANNEL']);
const SEND_PERMISSIONS = new Permissions([READ_PERMISSIONS, 'SEND_MESSAGES']);
const ATTACH_PERMISSIONS = new Permissions([SEND_PERMISSIONS, 'ATTACH_FILES']);
const EMBED_PERMISSIONS = new Permissions([SEND_PERMISSIONS, 'EMBED_LINKS']);

export class SkyraTextChannel extends Structures.get('TextChannel') {
	public set sniped(value: Message | null) {
		const previous = snipes.get(this);
		if (typeof previous !== 'undefined') this.client.clearTimeout(previous.timeout);

		if (value === null) {
			snipes.delete(this);
		} else {
			const next: SnipedMessage = {
				message: value,
				timeout: this.client.setTimeout(() => snipes.delete(this), 15000)
			};
			snipes.set(this, next);
		}
	}

	public get sniped() {
		const current = snipes.get(this);
		return typeof current === 'undefined' ? null : current.message;
	}

	public get attachable() {
		return this.permissionsFor(this.guild.me!)!.has(ATTACH_PERMISSIONS, false);
	}

	public get embedable() {
		return this.permissionsFor(this.guild.me!)!.has(EMBED_PERMISSIONS, false);
	}

	public get postable() {
		return this.permissionsFor(this.guild.me!)!.has(SEND_PERMISSIONS, false);
	}

	public get readable() {
		return this.permissionsFor(this.guild.me!)!.has(READ_PERMISSIONS, false);
	}
}

export interface SnipedMessage {
	message: Message;
	timeout: NodeJS.Timeout;
}

declare module 'discord.js' {
	export interface TextChannel {
		sniped: Message | null;
		readonly attachable: boolean;
		readonly embedable: boolean;
		readonly postable: boolean;
		readonly readable: boolean;
	}
}

Structures.extend('TextChannel', () => SkyraTextChannel);

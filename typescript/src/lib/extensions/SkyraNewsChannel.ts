import { Permissions, Structures } from 'discord.js';

const READ_PERMISSIONS = new Permissions(['VIEW_CHANNEL']);
const SEND_PERMISSIONS = new Permissions([READ_PERMISSIONS, 'SEND_MESSAGES']);
const ATTACH_PERMISSIONS = new Permissions([SEND_PERMISSIONS, 'ATTACH_FILES']);
const EMBED_PERMISSIONS = new Permissions([SEND_PERMISSIONS, 'EMBED_LINKS']);

export class SkyraNewsChannel extends Structures.get('NewsChannel') {
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

declare module 'discord.js' {
	export interface NewsChannel {
		readonly attachable: boolean;
		readonly embedable: boolean;
		readonly postable: boolean;
		readonly readable: boolean;
	}
}

Structures.extend('NewsChannel', () => SkyraNewsChannel);

/* eslint-disable @typescript-eslint/class-literal-property-style */
import { Structures } from 'discord.js';

export class SkyraDMChannel extends Structures.get('DMChannel') {
	public get attachable() {
		return true;
	}

	public get embedable() {
		return true;
	}

	public get postable() {
		return true;
	}

	public get readable() {
		return true;
	}
}

declare module 'discord.js' {
	export interface DMChannel {
		readonly attachable: boolean;
		readonly embedable: boolean;
		readonly postable: boolean;
		readonly readable: boolean;
		toString(): string;
	}
}

Structures.extend('DMChannel', () => SkyraDMChannel);

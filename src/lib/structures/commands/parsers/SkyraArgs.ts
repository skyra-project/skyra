import type { SkyraCommand } from '#lib/structures';
import { Args, CommandContext } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { TFunction } from 'i18next';
import type { Args as LexureArgs } from 'lexure';

export class SkyraArgs extends Args {
	public t: TFunction;

	public constructor(message: Message, command: SkyraCommand, parser: LexureArgs, context: CommandContext, t: TFunction) {
		super(message, command, parser, context);
		this.t = t;
	}
}

export interface SkyraArgs {
	command: SkyraCommand;
}

declare module '@sapphire/framework' {
	export interface Args {
		t: TFunction;
	}
}

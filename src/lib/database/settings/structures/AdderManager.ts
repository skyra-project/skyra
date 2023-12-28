import type { GuildEntity } from '#lib/database/entities/GuildEntity';
import { GuildSettings } from '#lib/database/keys';
import type { IBaseManager } from '#lib/database/settings/base/IBaseManager';
import { Adder } from '#lib/database/utils/Adder';
import { isNullishOrZero, type Nullish } from '@sapphire/utilities';

export type AdderKey = 'attachments' | 'capitals' | 'links' | 'messages' | 'newlines' | 'invites' | 'words' | 'reactions';

export class AdderManager implements IBaseManager {
	public attachments: Adder<string> | null = null;
	public capitals: Adder<string> | null = null;
	public links: Adder<string> | null = null;
	public messages: Adder<string> | null = null;
	public newlines: Adder<string> | null = null;
	public invites: Adder<string> | null = null;
	public words: Adder<string> | null = null;
	public reactions: Adder<string> | null = null;

	#settings: GuildEntity;

	public constructor(settings: GuildEntity) {
		this.#settings = settings;
	}

	public refresh(): void {
		const settings = this.#settings;
		this.attachments = this.makeAdder(
			settings[GuildSettings.Selfmod.Attachments.ThresholdMaximum], //
			settings[GuildSettings.Selfmod.Attachments.ThresholdDuration]
		);
		this.capitals = this.makeAdder(
			settings[GuildSettings.Selfmod.Capitals.ThresholdMaximum],
			settings[GuildSettings.Selfmod.Capitals.ThresholdDuration]
		);
		this.links = this.makeAdder(
			settings[GuildSettings.Selfmod.Links.ThresholdMaximum], //
			settings[GuildSettings.Selfmod.Links.ThresholdDuration]
		);
		this.messages = this.makeAdder(
			settings[GuildSettings.Selfmod.Messages.ThresholdMaximum],
			settings[GuildSettings.Selfmod.Messages.ThresholdDuration]
		);
		this.newlines = this.makeAdder(
			settings[GuildSettings.Selfmod.NewLines.ThresholdMaximum],
			settings[GuildSettings.Selfmod.NewLines.ThresholdDuration]
		);
		this.invites = this.makeAdder(
			settings[GuildSettings.Selfmod.Invites.ThresholdMaximum],
			settings[GuildSettings.Selfmod.Invites.ThresholdDuration]
		);
		this.words = this.makeAdder(
			settings[GuildSettings.Selfmod.Filter.ThresholdMaximum],
			settings[GuildSettings.Selfmod.Filter.ThresholdDuration]
		);
		this.reactions = this.makeAdder(
			settings[GuildSettings.Selfmod.Reactions.ThresholdMaximum],
			settings[GuildSettings.Selfmod.Reactions.ThresholdDuration]
		);
	}

	public onPatch(): void {
		const settings = this.#settings;
		this.attachments = this.updateAdder(
			this.attachments,
			settings[GuildSettings.Selfmod.Attachments.ThresholdMaximum],
			settings[GuildSettings.Selfmod.Attachments.ThresholdDuration]
		);
		this.capitals = this.updateAdder(
			this.capitals,
			settings[GuildSettings.Selfmod.Capitals.ThresholdMaximum],
			settings[GuildSettings.Selfmod.Capitals.ThresholdDuration]
		);
		this.links = this.updateAdder(
			this.links,
			settings[GuildSettings.Selfmod.Links.ThresholdMaximum],
			settings[GuildSettings.Selfmod.Links.ThresholdDuration]
		);
		this.messages = this.updateAdder(
			this.messages,
			settings[GuildSettings.Selfmod.Messages.ThresholdMaximum],
			settings[GuildSettings.Selfmod.Messages.ThresholdDuration]
		);
		this.newlines = this.updateAdder(
			this.newlines,
			settings[GuildSettings.Selfmod.NewLines.ThresholdMaximum],
			settings[GuildSettings.Selfmod.NewLines.ThresholdDuration]
		);
		this.invites = this.updateAdder(
			this.invites,
			settings[GuildSettings.Selfmod.Invites.ThresholdMaximum],
			settings[GuildSettings.Selfmod.Invites.ThresholdDuration]
		);
		this.words = this.updateAdder(
			this.words,
			settings[GuildSettings.Selfmod.Filter.ThresholdMaximum],
			settings[GuildSettings.Selfmod.Filter.ThresholdDuration]
		);
		this.reactions = this.updateAdder(
			this.reactions,
			settings[GuildSettings.Selfmod.Reactions.ThresholdMaximum],
			settings[GuildSettings.Selfmod.Reactions.ThresholdDuration]
		);
	}

	public onRemove(): void {
		this.attachments = null;
		this.capitals = null;
		this.links = null;
		this.messages = null;
		this.newlines = null;
		this.invites = null;
		this.words = null;
		this.reactions = null;
	}

	private makeAdder(maximum: number | Nullish, duration: number | Nullish) {
		if (isNullishOrZero(maximum) || isNullishOrZero(duration)) return null;
		return new Adder<string>(maximum, duration, true);
	}

	private updateAdder(adder: Adder<string> | null, maximum: number | Nullish, duration: number | Nullish) {
		if (isNullishOrZero(maximum) || isNullishOrZero(duration)) return null;
		if (!adder || adder.maximum !== maximum || adder.duration !== duration) return new Adder<string>(maximum, duration, true);
		return adder;
	}
}

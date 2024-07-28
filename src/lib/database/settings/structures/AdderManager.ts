import type { ReadonlyGuildData } from '#lib/database/settings/types';
import { Adder } from '#lib/database/utils/Adder';
import { isNullishOrZero, type Nullish } from '@sapphire/utilities';

export type AdderKey = 'attachments' | 'capitals' | 'links' | 'messages' | 'newlines' | 'invites' | 'words' | 'reactions';

export class AdderManager {
	public attachments: Adder<string> | null;
	public capitals: Adder<string> | null;
	public links: Adder<string> | null;
	public messages: Adder<string> | null;
	public newlines: Adder<string> | null;
	public invites: Adder<string> | null;
	public words: Adder<string> | null;
	public reactions: Adder<string> | null;

	public constructor(settings: ReadonlyGuildData) {
		this.attachments = this.makeAdder(settings.selfmodAttachmentsThresholdMaximum, settings.selfmodAttachmentsThresholdDuration);
		this.capitals = this.makeAdder(settings.selfmodCapitalsThresholdMaximum, settings.selfmodCapitalsThresholdDuration);
		this.links = this.makeAdder(settings.selfmodLinksThresholdMaximum, settings.selfmodLinksThresholdDuration);
		this.messages = this.makeAdder(settings.selfmodMessagesThresholdMaximum, settings.selfmodMessagesThresholdDuration);
		this.newlines = this.makeAdder(settings.selfmodNewlinesThresholdMaximum, settings.selfmodNewlinesThresholdDuration);
		this.invites = this.makeAdder(settings.selfmodInvitesThresholdMaximum, settings.selfmodInvitesThresholdDuration);
		this.words = this.makeAdder(settings.selfmodFilterThresholdMaximum, settings.selfmodFilterThresholdDuration);
		this.reactions = this.makeAdder(settings.selfmodReactionsThresholdMaximum, settings.selfmodReactionsThresholdDuration);
	}

	public onPatch(settings: ReadonlyGuildData): void {
		this.attachments = this.updateAdder(
			this.attachments,
			settings.selfmodAttachmentsThresholdMaximum,
			settings.selfmodAttachmentsThresholdDuration
		);
		this.capitals = this.updateAdder(this.capitals, settings.selfmodCapitalsThresholdMaximum, settings.selfmodCapitalsThresholdDuration);
		this.links = this.updateAdder(this.links, settings.selfmodLinksThresholdMaximum, settings.selfmodLinksThresholdDuration);
		this.messages = this.updateAdder(this.messages, settings.selfmodMessagesThresholdMaximum, settings.selfmodMessagesThresholdDuration);
		this.newlines = this.updateAdder(this.newlines, settings.selfmodNewlinesThresholdMaximum, settings.selfmodNewlinesThresholdDuration);
		this.invites = this.updateAdder(this.invites, settings.selfmodInvitesThresholdMaximum, settings.selfmodInvitesThresholdDuration);
		this.words = this.updateAdder(this.words, settings.selfmodFilterThresholdMaximum, settings.selfmodFilterThresholdDuration);
		this.reactions = this.updateAdder(this.reactions, settings.selfmodReactionsThresholdMaximum, settings.selfmodReactionsThresholdDuration);
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

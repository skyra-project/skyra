import { AdderManager } from '#lib/database/settings/structures/AdderManager';
import { PermissionNodeManager } from '#lib/database/settings/structures/PermissionNodeManager';
import type { ReadonlyGuildData } from '#lib/database/settings/types';
import { create } from '#utils/Security/RegexCreator';
import { RateLimitManager } from '@sapphire/ratelimits';
import { isNullish, isNullishOrEmpty } from '@sapphire/utilities';

export class SettingsContext {
	readonly #adders: AdderManager;
	readonly #permissionNodes: PermissionNodeManager;
	#wordFilterRegExp: RegExp | null;
	#noMentionSpam: RateLimitManager;

	public constructor(settings: ReadonlyGuildData) {
		this.#adders = new AdderManager(settings);
		this.#permissionNodes = new PermissionNodeManager(settings);
		this.#wordFilterRegExp = isNullishOrEmpty(settings.selfmodFilterRaw) ? null : new RegExp(create(settings.selfmodFilterRaw), 'gi');
		this.#noMentionSpam = new RateLimitManager(settings.noMentionSpamTimePeriod * 1000, settings.noMentionSpamMentionsAllowed);
	}

	public get adders() {
		return this.#adders;
	}

	public get permissionNodes() {
		return this.#permissionNodes;
	}

	public get wordFilterRegExp() {
		return this.#wordFilterRegExp;
	}

	public get noMentionSpam() {
		return this.#noMentionSpam;
	}

	public update(settings: ReadonlyGuildData, data: Partial<ReadonlyGuildData>) {
		this.#adders.onPatch(settings);

		if (!isNullish(data.permissionsRoles) || !isNullish(data.permissionsUsers)) {
			this.#permissionNodes.onPatch(settings);
		}

		if (!isNullish(data.noMentionSpamTimePeriod) || !isNullish(data.noMentionSpamMentionsAllowed)) {
			this.#noMentionSpam = new RateLimitManager(settings.noMentionSpamTimePeriod * 1000, settings.noMentionSpamMentionsAllowed);
		}

		if (!isNullish(data.selfmodFilterRaw)) {
			this.#wordFilterRegExp = isNullishOrEmpty(settings.selfmodFilterRaw) ? null : new RegExp(create(settings.selfmodFilterRaw), 'gi');
		}
	}
}

import { configurableKeys, GuildEntity, isSchemaKey, SerializerUpdateContext } from '@lib/database';
import { ApiRequest } from '@lib/structures/api/ApiRequest';
import { ApiResponse } from '@lib/structures/api/ApiResponse';
import { ApplyOptions } from '@skyra/decorators';
import { canManage } from '@utils/API';
import { authenticated, ratelimit } from '@utils/util';
import { Guild } from 'discord.js';
import { Route, RouteOptions } from 'klasa-dashboard-hooks';

@ApplyOptions<RouteOptions>({ name: 'guildSettings', route: 'guilds/:guild/settings' })
export default class extends Route {
	private readonly kBlockList: string[] = ['commandUses'];

	@authenticated()
	@ratelimit(2, 5000, true)
	public async get(request: ApiRequest, response: ApiResponse) {
		const guildID = request.params.guild;

		const guild = this.client.guilds.cache.get(guildID);
		if (!guild) return response.error(400);

		const member = await guild.members.fetch(request.auth!.user_id).catch(() => null);
		if (!member) return response.error(400);

		if (!(await canManage(guild, member))) return response.error(403);

		return guild.readSettings((settings) => response.json(settings));
	}

	@authenticated()
	@ratelimit(2, 1000, true)
	public async patch(request: ApiRequest, response: ApiResponse) {
		const requestBody = request.body as { guild_id: string; data: [string, unknown][] | undefined };

		if (!requestBody.guild_id || !Array.isArray(requestBody.data) || requestBody.guild_id !== request.params.guild) {
			return response.status(400).json(['Invalid body.']);
		}

		const guild = this.client.guilds.cache.get(requestBody.guild_id);
		if (!guild) return response.status(400).json(['Guild not found.']);

		const member = await guild.members.fetch(request.auth!.user_id).catch(() => null);
		if (!member) return response.status(400).json(['Member not found.']);

		if (!(await canManage(guild, member))) return response.error(403);

		const entries = requestBody.data;
		if (entries.some(([key]) => this.kBlockList.includes(key))) return response.error(400);

		try {
			const settings = await guild.writeSettings(async (settings) => {
				await this.validateAll(settings, guild, entries);

				for (const [key, value] of entries) {
					Reflect.set(settings, key, value);
				}

				return settings.toJSON();
			});

			return response.status(200).json(settings);
		} catch (errors) {
			return response.status(400).json(errors);
		}
	}

	private async validate(key: string, value: unknown, context: PartialSerializerUpdateContext) {
		const entry = configurableKeys.get(key);
		if (!entry || !isSchemaKey(entry)) throw `${key}: The key ${key} does not exist in the current schema.`;
		try {
			const result = await entry.serializer.isValid(value as any, { ...context, entry });
			if (!result) throw `${key}: The value is not valid.`;
		} catch (error) {
			if (error instanceof Error) throw error.message;
			throw error;
		}
	}

	private async validateAll(entity: GuildEntity, guild: Guild, pairs: readonly [string, unknown][]) {
		const context: PartialSerializerUpdateContext = {
			entity,
			guild,
			language: entity.getLanguage()
		};

		const errors: string[] = [];
		const promises = pairs.map((pair) => {
			if (!Array.isArray(pair) || pair.length !== 2) {
				errors.push('Invalid input error.');
				return null;
			}

			return this.validate(pair[0], pair[1], context).catch((error) => errors.push(error));
		});

		await Promise.all(promises);
		if (errors.length === 0) return;

		throw errors;
	}
}

type PartialSerializerUpdateContext = Omit<SerializerUpdateContext, 'entry'>;

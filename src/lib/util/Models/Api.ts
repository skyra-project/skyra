/* eslint-disable @typescript-eslint/no-namespace */
import { Client } from 'discord.js';

export function api(client: Client) {
	return (client as unknown as { api: Api }).api;
}

interface Api {
	channels: {
		(channel: string): {
			messages: {
				(message: string): {
					reactions: {
						(emoji: string): {
							'@me': {

							// PUT/DELETE DELETE /channels/{channel.id}/messages/{message.id}/reactions/{emoji.id}/@me
							} & Pick<ApiMethods, 'put' | 'delete'>;

							(userID: string): {

							// DELETE DELETE /channels/{channel.id}/messages/{message.id}/reactions/{user.id}/@me
							} & Pick<ApiMethods, 'delete'>;

						// GET DELETE /channels/{channel.id}/messages/{message.id}/reactions/{emoji.id}
						} & Pick<ApiMethods, 'get'>;

					// DELETE /channels/{channel.id}/messages/{message.id}/reactions
					} & Pick<ApiMethods, 'delete'>;

				// DELETE/PATCH /channels/{channel.id}/messages/{message.id}
				} & Pick<ApiMethods, 'delete' | 'patch'>;

				// POST /channels/{channel.id}/messages/bulk-delete
				'bulk-delete': Pick<ApiMethods, 'post'>;

			// POST /channels/{channel.id}/messages
			} & Pick<ApiMethods, 'get' | 'post'>;

			permissions: {
				// DELETE/PUT /channels/{channel.id}/permissions/{overwrite.id}
				(permission: string): {} & Pick<ApiMethods, 'delete' | 'put'>;
			};

			invites: {
				// GET/POST /channels/{channel.id}/invites
				(invite: string): {} & Pick<ApiMethods, 'get' | 'post'>;
			};

			typing: {

			// POST /channels/{channel.id}/typing
			} & Pick<ApiMethods, 'post'>;

			pins: {
				// DELETE/PUT /channels/{channel.id}/pins/{message.id}
				(message: string): {} & Pick<ApiMethods, 'delete' | 'put'>;

			// GET /channels/{channel.id}/pins
			} & Pick<ApiMethods, 'get'>;

			webhooks: {

			// GET/POST /channels/{channel.id}/webhooks
			} & Pick<ApiMethods, 'get' | 'post'>;

		// GET/PUT/PATCH/DELETE /channels/{channel.id}
		} & Pick<ApiMethods, 'get' | 'put' | 'patch' | 'delete'>;
	};
	guilds: {
		(id: string): {
			// GET /guilds/{guild.id}/audit-logs
			'audit-logs': Pick<ApiMethods, 'get'>;

			channels: {

			// GET/POST/PATCH /guilds/{guild.id}/channels
			} & Pick<ApiMethods, 'get' | 'post' | 'patch'>;

			members: {
				'@me': {
					nick: {

					// PATCH /guilds/{guild.id}/members/@me/nick
					} & Pick<ApiMethods, 'patch'>;
				};

				(member: string): {
					roles: {
						(role: string): {

							// DELETE/PUT /guilds/{guild.id}/members/{user.id}/roles/{role.id}
						} & Pick<ApiMethods, 'delete' | 'put'>;
					};

				// GET/DELETE/PUT/PATCH /guilds/{guild.id}/members/{user.id}
				} & Pick<ApiMethods, 'get' | 'delete' | 'put' | 'patch'>;

			// GET /guilds/{guild.id}/members
			} & Pick<ApiMethods, 'get'>;

			bans: {
				(user: string): {

				// GET/DELETE/PUT /guilds/{guild.id}/bans/{user.id}
				} & Pick<ApiMethods, 'get' | 'delete' | 'put'>;

			// GET /guilds/{guild.id}/bans
			} & Pick<ApiMethods, 'get'>;

			roles: {
				(role: string): {

				// DELETE/PATCH /guilds/{guild.id}/roles/{role.id}
				} & Pick<ApiMethods, 'delete' | 'patch'>;

			// GET/POST/PATCH /guilds/{guild.id}/roles
			} & Pick<ApiMethods, 'get' | 'post' | 'patch'>;

			emojis: {
				(emoji: string): {

				// GET/PATCH/DELETE /guilds/{guild.id}/emojis/{emoji.id}
				} & Pick<ApiMethods, 'get' | 'patch' | 'delete'>;

			// GET/POST /guilds/{guild.id}/emojis
			} & Pick<ApiMethods, 'get' | 'post'>;

			// GET/POST /guilds/{guild.id}/prune
			prune: {} & Pick<ApiMethods, 'get' | 'post'>;

			// GET /guilds/{guild.id}/regions
			regions: {} & Pick<ApiMethods, 'get'>;

			// GET /guilds/{guild.id}/invites
			invites: {} & Pick<ApiMethods, 'get'>;

			integrations: {
				(integration: string): {
					// POST /guilds/{guild.id}/integrations/{integration.id}/sync
					sync: {} & Pick<ApiMethods, 'post'>;

				// DELETE/PATCH /guilds/{guild.id}/integrations/{integration.id}
				} & Pick<ApiMethods, 'delete' | 'patch'>;

			// GET/POST /guilds/{guild.id}/integrations
			} & Pick<ApiMethods, 'get' | 'post'>;

			// GET/PATCH /guilds/{guild.id}/embed
			embed: {} & Pick<ApiMethods, 'get' | 'patch'>;

			// GET /guilds/{guild.id}/vanity-url
			'vanity-url': {} & Pick<ApiMethods, 'get'>;

			// GET /guilds/{guild.id}/widget.png
			'widget.png': {} & Pick<ApiMethods, 'get'>;

			webhooks: {

			// GET /guilds/{guild.id}/webhooks
			} & Pick<ApiMethods, 'get'>;

		// GET/PATCH/DELETE /guilds/{guild.id}
		} & Pick<ApiMethods, 'get' | 'patch' | 'delete'>;

	// POST /guilds
	} & Pick<ApiMethods, 'post'>;

	invites: {
		(invite: string): {

		// GET/DELETE /invites/{invite.code}
		} & Pick<ApiMethods, 'get' | 'delete'>;
	};

	users: {
		'@me': {
			guilds: {
				(guild: string): {

				// DELETE /users/@me/guilds/{guild.id}
				} & Pick<ApiMethods, 'delete'>;

			// GET /users/@me/guilds
			} & Pick<ApiMethods, 'get'>;

			channels: {

			// GET/POST /users/@me/channels
			} & Pick<ApiMethods, 'get' | 'post'>;

			connections: {

			// GET /users/@me/connections
			} & Pick<ApiMethods, 'get'>;

		// GET/PATCH /users/@me
		} & Pick<ApiMethods, 'get' | 'patch'>;

		(user: string): {

		// GET/users/{user.id}
		} & Pick<ApiMethods, 'get'>;
	};

	voice: {
		regions: {

		// GET /voice/regions
		} & Pick<ApiMethods, 'get'>;
	};

	webhooks: {
		(webhook: string): {
			(token: string): {
				slack: {

				// POST /webhooks/{webhook.id}/{webhook.token}/slack
				} & Pick<ApiMethods, 'post'>;

				github: {

					// POST /webhooks/{webhook.id}/{webhook.token}/github
				} & Pick<ApiMethods, 'post'>;

			// GET/PATCH/DELETE/POST /webhooks/{webhook.id}/{webhook.token}
			} & Pick<ApiMethods, 'get' | 'patch' | 'delete' | 'post'>;

		// GET/PATCH/DELETE /webhooks/{webhook.id}
		} & Pick<ApiMethods, 'get' | 'patch' | 'delete'>;
	};
}

interface ApiMethods {
	get(data?: { query?: Record<string, string | number | undefined> }): Promise<unknown>;
	post(data: unknown): Promise<unknown>;
	put(data?: unknown): Promise<unknown>;
	patch(data: unknown): Promise<unknown>;
	delete(data?: { reason?: string }): Promise<unknown>;
}

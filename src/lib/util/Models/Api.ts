/* eslint-disable @typescript-eslint/unified-signatures */
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
	guilds: ApiGuilds;
	invites: ApiInvites;
	users: ApiUsers;
	voice: ApiVoice;
	webhooks: ApiWebhooks;
}

// interface ApiChannelsChannelWebhooks {
// 	/**
// 	 * Returns a list of channel webhook objects. Requires the `MANAGE_WEBHOOKS` permission.
// 	 * @endpoint /channels/{channel.id}/webhooks
// 	 * @url https://discordapp.com/developers/docs/resources/webhook#get-channel-webhooks
// 	 */
// 	get: ApiMethods['get'];

// 	/**
// 	 * Create a new webhook. Requires the `MANAGE_WEBHOOKS` permission. Returns a webhook object on success.
// 	 * @endpoint /webhooks/{webhook.id}/{webhook.token}/slack
// 	 * @url https://discordapp.com/developers/docs/resources/webhook#create-webhook
// 	 */
// 	post: ApiMethods['post'];
// }

// interface ApiGuildsGuildWebhooks {
// 	/**
// 	 * Returns a list of guild webhook objects. Requires the `MANAGE_WEBHOOKS` permission.
// 	 * @endpoint /guilds/{guild.id}/webhooks
// 	 * @url https://discordapp.com/developers/docs/resources/webhook#get-guild-webhooks
// 	 */
// 	get: ApiMethods['get'];
// }

/**
 * @endpoint /guilds
 */
interface ApiGuilds {
	/**
	 * Create a new guild. Returns a guild object on success. Fires a Guild Create Gateway event.
	 * @url https://discordapp.com/developers/docs/resources/guild#create-guild
	 */
	post: ApiMethods['post'];

	(guildID: string): ApiGuildsGuild;
}

/**
 * @endpoint /guilds/{guild.id}
 */
interface ApiGuildsGuild {
	/**
	 * Returns the guild object for the given id.
	 * @url https://discordapp.com/developers/docs/resources/guild#get-guild
	 */
	get: ApiMethods['get'];

	/**
	 * Modify a guild's settings. Requires the `MANAGE_GUILD` permission. Returns the updated guild object on success.
	 * Fires a Guild Update Gateway event.
	 * @url https://discordapp.com/developers/docs/resources/guild#modify-guild
	 */
	patch: ApiMethods['patch'];

	/**
	 * Delete a guild permanently. User must be owner. Returns `204 No Content` on success. Fires a Guild Delete Gateway
	 * event.
	 * @url https://discordapp.com/developers/docs/resources/guild#delete-guild
	 */
	delete: ApiMethods['delete'];

	/**
	 * Channel endpoints.
	 */
	channels: ApiGuildsGuildChannels;

	/**
	 * Member endpoints.
	 */
	members: ApiGuildsGuildMembers;

	/**
	 * Ban endpoints.
	 */
	bans: ApiGuildsGuildBans;

	/**
	 * Role endpoints.
	 */
	roles: ApiGuildsGuildRoles;

	/**
	 * Prune endpoints.
	 */
	prune: ApiGuildsGuildPrune;

	/**
	 * Region endpoints.
	 */
	regions: ApiGuildsGuildRegions;

	/**
	 * Invite endpoints.
	 */
	invites: ApiGuildsGuildInvites;

	/**
	 * Integration endpoints.
	 */
	integrations: ApiGuildsGuildIntegrations;

	/**
	 * Embed endpoints.
	 */
	embed: ApiGuildsGuildEmbed;

	/**
	 * Vanity URL endpoints.
	 */
	'vanity-url': ApiGuildsGuildVanityUrl;

	/**
	 * Widget endpoints.
	 */
	'widget.png': ApiGuildsGuildWidget;
}

/**
 * @endpoint /guilds/{guild.id}/channels
 */
interface ApiGuildsGuildChannels {
	/**
	 * Returns a list of guild channel objects.
	 * @url https://discordapp.com/developers/docs/resources/guild#get-guild-channels
	 */
	get: ApiMethods['get'];

	/**
	 * Create a new channel object for the guild. Requires the `MANAGE_CHANNELS` permission. Returns the new channel
	 * object on success. Fires a Channel Create Gateway event.
	 * @url https://discordapp.com/developers/docs/resources/guild#create-guild-channel
	 */
	post: ApiMethods['post'];

	/**
	 * Modify the positions of a set of channel objects for the guild. Requires `MANAGE_CHANNELS` permission. Returns a
	 * 204 empty response on success. Fires multiple Channel Update Gateway events.
	 * @url https://discordapp.com/developers/docs/resources/guild#modify-guild-channel-positions
	 */
	patch: ApiMethods['patch'];
}

/**
 * @endpoint /guilds/{guild.id}/members
 */
interface ApiGuildsGuildMembers {
	/**
	 * Returns a list of guild member objects that are members of the guild.
	 * @url https://discordapp.com/developers/docs/resources/guild#list-guild-members
	 */
	get: ApiMethods['get'];

	'@me': ApiGuildsGuildMembersMe;

	(memberID: '@me'): ApiGuildsGuildMembersMe;
	(memberID: string): ApiGuildsGuildMembersMember;
}

/**
 * @endpoint /guilds/{guild.id}/members/{user.id}
 */
interface ApiGuildsGuildMembersMember {
	/**
	 * Returns a guild member object for the specified user.
	 * @url https://discordapp.com/developers/docs/resources/guild#get-guild-member
	 */
	get: ApiMethods['get'];

	/**
	 * Adds a user to the guild, provided you have a valid oauth2 access token for the user with the `guilds.join`
	 * scope. Returns a 201 Created with the guild member as the body, or 204 No Content if the user is already a member
	 * of the guild. Fires a Guild Member Add Gateway event. Requires the bot to have the `CREATE_INSTANT_INVITE`
	 * permission.
	 * @url https://discordapp.com/developers/docs/resources/guild#add-guild-member
	 */
	put: ApiMethods['put'];

	/**
	 * Modify attributes of a guild member. Returns a 204 empty response on success. Fires a Guild Member Update Gateway
	 * event. If the `channel_id` is set to null, this will force the target user to be disconnected from voice.
	 * @url https://discordapp.com/developers/docs/resources/guild#modify-guild-member
	 */
	patch: ApiMethods['patch'];

	/**
	 * Remove a member from a guild. Requires `KICK_MEMBERS` permission. Returns a 204 empty response on success. Fires
	 * a Guild Member Remove Gateway event.
	 * @url https://discordapp.com/developers/docs/resources/guild#remove-guild-member
	 */
	delete: ApiMethods['delete'];

	roles: ApiGuildsGuildMembersMemberRoles;
}

interface ApiGuildsGuildMembersMemberRoles {
	(roleID: string): ApiGuildsGuildMembersMemberRolesRole;
}

/**
 * @endpoint /guilds/{guild.id}/members/{user.id}/roles/{role.id}
 */
interface ApiGuildsGuildMembersMemberRolesRole {
	/**
	 * Adds a role to a guild member. Requires the `MANAGE_ROLES` permission. Returns a 204 empty response on success.
	 * Fires a Guild Member Update Gateway event.
	 * @url https://discordapp.com/developers/docs/resources/guild#add-guild-member-role
	 */
	put: ApiMethods['put'];

	/**
	 * Removes a role from a guild member. Requires the `MANAGE_ROLES` permission. Returns a 204 empty response on
	 * success. Fires a Guild Member Update Gateway event.
	 * @url https://discordapp.com/developers/docs/resources/guild#remove-guild-member-role
	 */
	delete: ApiMethods['delete'];
}

interface ApiGuildsGuildMembersMe {
	nick: ApiGuildsGuildMembersMeNick;
}

/**
 * @endpoint /guilds/{guild.id}/members/@me/nick
 */
interface ApiGuildsGuildMembersMeNick {
	/**
	 * Modifies the nickname of the current user in a guild. Returns a 200 with the nickname on success. Fires a Guild
	 * Member Update Gateway event.
	 * @url https://discordapp.com/developers/docs/resources/guild#modify-current-user-nick
	 */
	patch: ApiMethods['patch'];
}

/**
 * @endpoint /guilds/{guild.id}/bans
 */
interface ApiGuildsGuildBans {
	/**
	 * Returns a list of ban objects for the users banned from this guild. Requires the `BAN_MEMBERS` permission.
	 * @url https://discordapp.com/developers/docs/resources/guild#get-guild-bans
	 */
	get: ApiMethods['get'];

	(userID: string): ApiGuildsGuildBansUser;
}

/**
 * @endpoint /guilds/{guild.id}/bans/{user.id}
 */
interface ApiGuildsGuildBansUser {
	/**
	 * Returns a ban object for the given user or a 404 not found if the ban cannot be found. Requires the `BAN_MEMBERS`
	 * permission.
	 * @url https://discordapp.com/developers/docs/resources/guild#get-guild-ban
	 */
	get: ApiMethods['get'];

	/**
	 * Create a guild ban, and optionally delete previous messages sent by the banned user. Requires the `BAN_MEMBERS`
	 * permission. Returns a 204 empty response on success. Fires a Guild Ban Add Gateway event.
	 * @url https://discordapp.com/developers/docs/resources/guild#create-guild-ban
	 */
	put: ApiMethods['put'];

	/**
	 * Remove the ban for a user. Requires the `BAN_MEMBERS` permissions. Returns a 204 empty response on success. Fires
	 * a Guild Ban Remove Gateway event.
	 * @url https://discordapp.com/developers/docs/resources/guild#remove-guild-ban
	 */
	delete: ApiMethods['delete'];
}

/**
 * @endpoint /guilds/{guild.id}/roles
 */
interface ApiGuildsGuildRoles {
	/**
	 * Returns a list of role objects for the guild.
	 * @url https://discordapp.com/developers/docs/resources/guild#get-guild-roles
	 */
	get: ApiMethods['get'];

	/**
	 * Create a new role for the guild. Requires the `MANAGE_ROLES` permission. Returns the new role object on success.
	 * Fires a Guild Role Create Gateway event. All JSON params are optional.
	 * @url https://discordapp.com/developers/docs/resources/guild#create-guild-role
	 */
	post: ApiMethods['post'];

	/**
	 * Modify the positions of a set of role objects for the guild. Requires the `MANAGE_ROLES` permission. Returns a
	 * list of all of the guild's role objects on success. Fires multiple Guild Role Update Gateway events.
	 * @url https://discordapp.com/developers/docs/resources/guild#modify-guild-role-positions
	 */
	patch: ApiMethods['patch'];

	(roleID: string): ApiGuildsGuildRolesRole;
}

/**
 * @endpoint /guilds/{guild.id}/roles/{role.id}
 */
interface ApiGuildsGuildRolesRole {

	/**
	 * Delete a guild role. Requires the `MANAGE_ROLES` permission. Returns a 204 empty response on success. Fires a
	 * Guild Role Delete Gateway event.
	 * @url https://discordapp.com/developers/docs/resources/guild#delete-guild-role
	 */
	delete: ApiMethods['delete'];
}

/**
 * @endpoint /guilds/{guild.id}/prune
 */
interface ApiGuildsGuildPrune {
	/**
	 * Returns an object with one 'pruned' key indicating the number of members that would be removed in a prune
	 * operation. Requires the `KICK_MEMBERS` permission.
	 * @url https://discordapp.com/developers/docs/resources/guild#get-guild-prune-count
	 */
	get: ApiMethods['get'];

	/**
	 * Begin a prune operation. Requires the `KICK_MEMBERS` permission. Returns an object with one 'pruned' key
	 * indicating the number of members that were removed in the prune operation. For large guilds it's recommended to
	 * set the `compute_prune_count` option to `false`, forcing 'pruned' to `null`. Fires multiple Guild Member Remove
	 * Gateway events.
	 * @url https://discordapp.com/developers/docs/resources/guild#begin-guild-prune
	 */
	post: ApiMethods['post'];
}

/**
 * @endpoint /guilds/{guild.id}/regions
 */
interface ApiGuildsGuildRegions {
	/**
	 * Returns a list of voice region objects for the guild. Unlike the similar `/voice` route, this returns VIP servers
	 * when the guild is VIP-enabled.
	 * @url https://discordapp.com/developers/docs/resources/guild#get-guild-voice-regions
	 */
	get: ApiMethods['get'];
}

/**
 * @endpoint /guilds/{guild.id}/invites
 */
interface ApiGuildsGuildInvites {
	/**
	 * Returns a list of invite objects (with invite metadata) for the guild. Requires the `MANAGE_GUILD` permission.
	 * @url https://discordapp.com/developers/docs/resources/guild#get-guild-invites
	 */
	get: ApiMethods['get'];
}

/**
 * @endpoint /guilds/{guild.id}/integrations
 */
interface ApiGuildsGuildIntegrations {
	/**
	 * Returns a list of integration objects for the guild. Requires the `MANAGE_GUILD` permission.
	 * @url https://discordapp.com/developers/docs/resources/guild#get-guild-integrations
	 */
	get: ApiMethods['get'];

	/**
	 * Attach an integration object from the current user to the guild. Requires the `MANAGE_GUILD` permission. Returns
	 * a 204 empty response on success. Fires a Guild Integrations Update Gateway event.
	 * @url https://discordapp.com/developers/docs/resources/guild#create-guild-integration
	 */
	post: ApiMethods['post'];

	/**
	 * Modify the behavior and settings of an integration object for the guild. Requires the `MANAGE_GUILD` permission.
	 * Returns a 204 empty response on success. Fires a Guild Integrations Update Gateway event.
	 * @url https://discordapp.com/developers/docs/resources/guild#modify-guild-integration
	 */
	patch: ApiMethods['patch'];

	(integrationID: string): ApiGuildsGuildIntegrationsIntegration;
}

/**
 * @endpoint /guilds/{guild.id}/integrations/{integration.id}
 */
interface ApiGuildsGuildIntegrationsIntegration {
	/**
	 * Delete the attached integration object for the guild. Requires the `MANAGE_GUILD` permission. Returns a 204 empty
	 * response on success. Fires a Guild Integrations Update Gateway event.
	 * @url https://discordapp.com/developers/docs/resources/guild#delete-guild-integration
	 */
	delete: ApiMethods['delete'];

	sync: ApiGuildsGuildIntegrationsIntegrationSync;
}

/**
 * @endpoint /guilds/{guild.id}/integrations/{integration.id}/sync
 */
interface ApiGuildsGuildIntegrationsIntegrationSync {
	/**
	 * Sync an integration. Requires the `MANAGE_GUILD` permission. Returns a 204 empty response on success.
	 * @url https://discordapp.com/developers/docs/resources/guild#sync-guild-integration
	 */
	post: ApiMethods['post'];
}

/**
 * @endpoint /guilds/{guild.id}/embed
 */
interface ApiGuildsGuildEmbed {
	/**
	 * Returns the guild embed object. Requires the `MANAGE_GUILD` permission.
	 * @url https://discordapp.com/developers/docs/resources/guild#get-guild-embed
	 */
	get: ApiMethods['get'];

	/**
	 * Modify a guild embed object for the guild. All attributes may be passed in with JSON and modified. Requires the
	 * `MANAGE_GUILD` permission. Returns the updated guild embed object.
	 * @url https://discordapp.com/developers/docs/resources/guild#modify-guild-embed
	 */
	patch: ApiMethods['patch'];
}

/**
 * @endpoint /guilds/{guild.id}/vanity-url
 */
interface ApiGuildsGuildVanityUrl {
	/**
	 * Returns a partial invite object for guilds with that feature enabled. Requires the `MANAGE_GUILD` permission.
	 * `code` will be null if a vanity url for the guild is not set.
	 * @url https://discordapp.com/developers/docs/resources/guild#get-guild-vanity-url
	 */
	get: ApiMethods['get'];
}

/**
 * /guilds/{guild.id}/widget.png
 */
interface ApiGuildsGuildWidget {
	/**
	 * Returns a PNG image widget for the guild. Requires no permissions or authentication. The same documentation also
	 * applies to `embed.png`.
	 * @url https://discordapp.com/developers/docs/resources/guild#get-guild-widget-image
	 */
	get: ApiMethods['get'];
}

interface ApiInvites {
	(inviteID: string): ApiInvitesInvite;
}

/**
 * @endpoint /invites/{invite.code}
 */
interface ApiInvitesInvite {
	/**
	 * Returns an invite object for the given code.
	 * @url https://discordapp.com/developers/docs/resources/invite#get-invite
	 */
	get: ApiMethods['get'];

	/**
	 * Delete an invite. Requires the `MANAGE_CHANNELS` permission on the channel this invite belongs to, or
	 * `MANAGE_GUILD` to remove any invite across the guild. Returns an invite object on success.
	 * @url https://discordapp.com/developers/docs/resources/invite#delete-invite
	 */
	delete: ApiMethods['delete'];
}

interface ApiUsers {
	'@me': ApiUsersMe;

	(userID: '@me'): ApiUsersMe;
	(userID: string): ApiUsersUser;
}

/**
 * @endpoint /users/{user.id}
 */
interface ApiUsersUser {
	/**
	 * Returns a user object for a given user ID.
	 * @url https://discordapp.com/developers/docs/resources/user#get-user
	 */
	get: ApiMethods['get'];
}

/**
 * @endpoint /users/@me
 */
interface ApiUsersMe {
	/**
	 * Returns the user object of the requester's account. For OAuth2, this requires the identify scope, which will
	 * return the object without an email, and optionally the email scope, which returns the object with an email.
	 * @url https://discordapp.com/developers/docs/resources/user#get-current-user
	 */
	get: ApiMethods['get'];

	/**
	 * Modify the requester's user account settings. Returns a user object on success.
	 * @url https://discordapp.com/developers/docs/resources/user#modify-current-user
	 */
	patch: ApiMethods['patch'];

	/**
	 * Guild-related endpoints.
	 */
	guilds: ApiUsersMeGuilds;

	/**
	 * Channel-related endpoints.
	 */
	channels: ApiUsersMeChannels;

	/**
	 * Connection-related endpoints.
	 */
	connections: ApiUsersMeConnections;
}

/**
 * @endpoint /users/@me/guilds
 */
interface ApiUsersMeGuilds {
	/**
	 * Returns a list of partial guild objects the current user is a member of. Requires the `guilds` OAuth2 scope.
	 * @url https://discordapp.com/developers/docs/resources/user#get-current-user-guilds
	 */
	get: ApiMethods['get'];

	/**
	 * Guild-related endpoints.
	 */
	(guildID: string): ApiUsersMeGuildsGuild;
}

/**
 * @endpoint /users/@me/guilds/{guild.id}
 */
interface ApiUsersMeGuildsGuild {
	/**
	 * Leave a guild. Returns a 204 empty response on success.
	 * @url https://discordapp.com/developers/docs/resources/user#leave-guild
	 */
	delete: ApiMethods['delete'];
}

/**
 * @endpoint /users/@me/channels
 */
interface ApiUsersMeChannels {
	/**
	 * Returns a list of DM channel objects. For bots, this is no longer a supported method of getting recent DMs, and
	 * will return an empty array.
	 * @url https://discordapp.com/developers/docs/resources/user#get-user-dms
	 */
	get: ApiMethods['get'];

	/**
	 * Create a new DM channel with a user. Returns a DM channel object.
	 * @url https://discordapp.com/developers/docs/resources/user#create-dm
	 */
	post: ApiMethods['post'];
}

interface ApiUsersMeConnections {
	/**
	 * Returns a list of connection objects. Requires the `connections` OAuth2 scope.
	 * @url https://discordapp.com/developers/docs/resources/user#get-user-connections
	 */
	get: ApiMethods['get'];
}

interface ApiVoice {
	regions: ApiVoiceRegions;
}

/**
 * @endpoint /voice/regions
 */
interface ApiVoiceRegions {
	/**
	 * Returns an array of voice region objects that can be used when creating servers.
	 * @url https://discordapp.com/developers/docs/resources/voice#list-voice-regions
	 */
	get: ApiMethods['get'];
}

interface ApiWebhooks {
	/**
	 * Access to a webhook by its ID.
	 */
	(webhookID: string): ApiWebhooksWebhook;
}

/**
 * @endpoint /webhooks/{webhook.id}
 */
interface ApiWebhooksWebhook {
	/**
	 * Returns the new webhook object for the given id.
	 * @url https://discordapp.com/developers/docs/resources/webhook#get-webhook
	 */
	get: ApiMethods['get'];

	/**
	 * Modify a webhook. Requires the `MANAGE_WEBHOOKS` permission. Returns the updated webhook object on success.
	 * @url https://discordapp.com/developers/docs/resources/webhook#modify-webhook
	 */
	patch: ApiMethods['patch'];

	/**
	 * Delete a webhook permanently. User must be owner. Returns a 204 NO CONTENT response on success.
	 * @url https://discordapp.com/developers/docs/resources/webhook#delete-webhook
	 */
	delete: ApiMethods['delete'];

	/**
	 * Access to a token.
	 */
	(token: string): ApiWebhooksWebhookToken;
}

/**
 * @endpoint /webhooks/{webhook.id}/{webhook.token}
 */
interface ApiWebhooksWebhookToken {
	/**
	 * Same as the non-token version, except this call does not require authentication and returns no user in the
	 * webhook object.
	 * @url https://discordapp.com/developers/docs/resources/webhook#get-webhook-with-token
	 */
	get: ApiMethods['get'];

	/**
	 * Same as the non-token version, except this call does not require authentication, does not accept a `channel_id`
	 * parameter in the body, and does not return a user in the webhook object.
	 * @url https://discordapp.com/developers/docs/resources/webhook#modify-webhook-with-token
	 */
	patch: ApiMethods['patch'];

	/**
	 * Same as the non-token version, except this call does not require authentication.
	 * @url https://discordapp.com/developers/docs/resources/webhook#delete-webhook-with-token
	 */
	delete: ApiMethods['delete'];

	/**
	 * Sends a message.
	 * @url https://discordapp.com/developers/docs/resources/webhook#execute-webhook
	 */
	post: ApiMethods['post'];

	/**
	 * The slack endpoint.
	 */
	slack: ApiWebhooksWebhookTokenSlack;

	/**
	 * The github endpoint.
	 */
	github: ApiWebhooksWebhookTokenGitHub;
}

/**
 * @endpoint /webhooks/{webhook.id}/{webhook.token}/slack
 */
interface ApiWebhooksWebhookTokenSlack {
	/**
	 * Sends a message with the Slack format.
	 * @url https://discordapp.com/developers/docs/resources/webhook#execute-slackcompatible-webhook
	 */
	post: ApiMethods['post'];
}

/**
 * @endpoint /webhooks/{webhook.id}/{webhook.token}/github
 */
interface ApiWebhooksWebhookTokenGitHub {
	/**
	 * Sends a message with the GitHub format.
	 * @url https://discordapp.com/developers/docs/resources/webhook#execute-githubcompatible-webhook
	 */
	post: ApiMethods['post'];
}

interface ApiMethods {
	get(data?: { query?: Record<string, string | number | undefined> }): Promise<unknown>;
	post(data: unknown): Promise<unknown>;
	put(data?: unknown): Promise<unknown>;
	patch(data: unknown): Promise<unknown>;
	delete(data?: { reason?: string }): Promise<unknown>;
}

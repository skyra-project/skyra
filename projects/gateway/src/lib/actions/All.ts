import { GatewayDispatchEvents, GatewayDispatchPayload } from 'discord-api-types/v10';
import { handleChannelCreate } from './ChannelCreate';
import { handleChannelDelete } from './ChannelDelete';
import { handleChannelUpdate } from './ChannelUpdate';
import { handleGuildBanAdd } from './GuildBanAdd';
import { handleGuildBanRemove } from './GuildBanRemove';
import { handleGuildCreate } from './GuildCreate';
import { handleGuildDelete } from './GuildDelete';
import { handleGuildEmojisUpdate } from './GuildEmojisUpdate';
import { handleGuildMemberAdd } from './GuildMemberAdd';
import { handleGuildMemberRemove } from './GuildMemberRemove';
import { handleGuildMembersChunk } from './GuildMembersChunk';
import { handleGuildMemberUpdate } from './GuildMemberUpdate';
import { handleGuildRoleCreate } from './GuildRoleCreate';
import { handleGuildRoleDelete } from './GuildRoleDelete';
import { handleGuildRoleUpdate } from './GuildRoleUpdate';
import { handleGuildStickersUpdate } from './GuildStickersUpdate';
import { handleGuildUpdate } from './GuildUpdate';
import { handleMessageCreate } from './MessageCreate';
import { handleMessageDelete } from './MessageDelete';
import { handleMessageDeleteBulk } from './MessageDeleteBulk';
import { handleMessageReactionAdd } from './MessageReactionAdd';
import { handleMessageReactionRemove } from './MessageReactionRemove';
import { handleMessageReactionRemoveAll } from './MessageReactionRemoveAll';
import { handleMessageReactionRemoveEmoji } from './MessageReactionRemoveEmoji';
import { handleMessageUpdate } from './MessageUpdate';

export function all(payload: GatewayDispatchPayload) {
	switch (payload.t) {
		case GatewayDispatchEvents.ChannelCreate:
			return handleChannelCreate(payload.d);
		case GatewayDispatchEvents.ChannelDelete:
			return handleChannelDelete(payload.d);
		case GatewayDispatchEvents.ChannelUpdate:
			return handleChannelUpdate(payload.d);
		case GatewayDispatchEvents.GuildBanAdd:
			return handleGuildBanAdd(payload.d);
		case GatewayDispatchEvents.GuildBanRemove:
			return handleGuildBanRemove(payload.d);
		case GatewayDispatchEvents.GuildCreate:
			return handleGuildCreate(payload.d);
		case GatewayDispatchEvents.GuildDelete:
			return handleGuildDelete(payload.d);
		case GatewayDispatchEvents.GuildEmojisUpdate:
			return handleGuildEmojisUpdate(payload.d);
		case GatewayDispatchEvents.GuildMemberAdd:
			return handleGuildMemberAdd(payload.d);
		case GatewayDispatchEvents.GuildMemberRemove:
			return handleGuildMemberRemove(payload.d);
		case GatewayDispatchEvents.GuildMembersChunk:
			return handleGuildMembersChunk(payload.d);
		case GatewayDispatchEvents.GuildMemberUpdate:
			return handleGuildMemberUpdate(payload.d);
		case GatewayDispatchEvents.GuildRoleCreate:
			return handleGuildRoleCreate(payload.d);
		case GatewayDispatchEvents.GuildRoleDelete:
			return handleGuildRoleDelete(payload.d);
		case GatewayDispatchEvents.GuildRoleUpdate:
			return handleGuildRoleUpdate(payload.d);
		case GatewayDispatchEvents.GuildStickersUpdate:
			return handleGuildStickersUpdate(payload.d);
		case GatewayDispatchEvents.GuildUpdate:
			return handleGuildUpdate(payload.d);
		case GatewayDispatchEvents.MessageCreate:
			return handleMessageCreate(payload.d);
		case GatewayDispatchEvents.MessageDelete:
			return handleMessageDelete(payload.d);
		case GatewayDispatchEvents.MessageDeleteBulk:
			return handleMessageDeleteBulk(payload.d);
		case GatewayDispatchEvents.MessageReactionAdd:
			return handleMessageReactionAdd(payload.d);
		case GatewayDispatchEvents.MessageReactionRemove:
			return handleMessageReactionRemove(payload.d);
		case GatewayDispatchEvents.MessageReactionRemoveAll:
			return handleMessageReactionRemoveAll(payload.d);
		case GatewayDispatchEvents.MessageReactionRemoveEmoji:
			return handleMessageReactionRemoveEmoji(payload.d);
		case GatewayDispatchEvents.MessageUpdate:
			return handleMessageUpdate(payload.d);
		// case GatewayDispatchEvents.ChannelPinsUpdate:
		// case GatewayDispatchEvents.GuildIntegrationsUpdate:
		// case GatewayDispatchEvents.IntegrationCreate:
		// case GatewayDispatchEvents.IntegrationDelete:
		// case GatewayDispatchEvents.IntegrationUpdate:
		// case GatewayDispatchEvents.InteractionCreate:
		// case GatewayDispatchEvents.InviteCreate:
		// case GatewayDispatchEvents.InviteDelete:
		// case GatewayDispatchEvents.PresenceUpdate:
		// case GatewayDispatchEvents.StageInstanceCreate:
		// case GatewayDispatchEvents.StageInstanceDelete:
		// case GatewayDispatchEvents.StageInstanceUpdate:
		// case GatewayDispatchEvents.Ready:
		// case GatewayDispatchEvents.Resumed:
		// case GatewayDispatchEvents.ThreadCreate:
		// case GatewayDispatchEvents.ThreadDelete:
		// case GatewayDispatchEvents.ThreadListSync:
		// case GatewayDispatchEvents.ThreadMembersUpdate:
		// case GatewayDispatchEvents.ThreadMemberUpdate:
		// case GatewayDispatchEvents.ThreadUpdate:
		// case GatewayDispatchEvents.TypingStart:
		// case GatewayDispatchEvents.UserUpdate:
		// case GatewayDispatchEvents.VoiceServerUpdate:
		// case GatewayDispatchEvents.VoiceStateUpdate:
		// case GatewayDispatchEvents.WebhooksUpdate:
		// case GatewayDispatchEvents.GuildScheduledEventCreate:
		// case GatewayDispatchEvents.GuildScheduledEventUpdate:
		// case GatewayDispatchEvents.GuildScheduledEventDelete:
		// case GatewayDispatchEvents.GuildScheduledEventUserAdd:
		// case GatewayDispatchEvents.GuildScheduledEventUserRemove:
		default:
			return null;
	}
}

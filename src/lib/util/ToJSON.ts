const { User, GuildMember, Role, Channel, Guild } = require('discord.js');
const { clientID } = require('../../../config');

export default class ToJSON {

	public static user(data) {
		if (!(data instanceof User)) return null;
		return {
			id: data.id,
			username: data.username,
			discriminator: data.discriminator,
			avatar: data.avatar,
			bot: data.bot,
			createdTimestamp: data.createdTimestamp
		};
	}

	public static guildMember(data) {
		if (!(data instanceof GuildMember)) return null;
		return {
			id: data.id,
			user: ToJSON.user(data.user),
			nickname: data.nickname || null,
			roles: data.roles.map(ToJSON.role),
			kickable: data.kickable,
			bannable: data.bannable,
			manageable: data.manageable,
			color: data.displayHexColor,
			joinedTimestamp: data.joinedTimestamp
		};
	}

	public static guild(data) {
		if (!(data instanceof Guild)) return null;
		return {
			id: data.id,
			name: data.name,
			available: data.available,
			features: data.features,
			icon: data.icon,
			memberCount: data.memberCount,
			ownerID: data.ownerID,
			region: data.region,
			verificationLevel: data.verificationLevel,
			verified: data.verified,
			roles: data.roles.map(ToJSON.role),
			createdTimestamp: data.createdTimestamp
		};
	}

	public static role(data) {
		if (!(data instanceof Role)) return null;
		return {
			id: data.id,
			name: data.name,
			createdTimestamp: data.createdTimestamp,
			color: data.hexColor,
			hoist: data.hoist,
			permissions: data.permissions.bitfield,
			position: data.position
		};
	}

	public static channel(data) {
		if (!(data instanceof Channel)) return null;
		const output = {
			id: data.id,
			type: data.type,
			createdTimestamp: data.createdTimestamp
		};
		if (output.type === 'text' || output.type === 'voice') {
			Object.assign(output, {
				name: data.name,
				nsfw: data.nsfw,
				position: data.position,
				permissions: data.permissionsFor(clientID).bitfield
			});
		}

		return output;
	}

}

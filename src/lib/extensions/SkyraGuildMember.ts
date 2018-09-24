import { Structures } from 'discord.js';
import MemberSettings from '../structures/MemberSettings';

module.exports = Structures.extend('GuildMember', (GuildMember) => class SkyraGuildMember extends GuildMember {

	public settings: MemberSettings = new MemberSettings(this);

});

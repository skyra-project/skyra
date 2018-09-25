import { Structures } from 'discord.js';
import MemberSettings from '../structures/MemberSettings';

export default Structures.extend('GuildMember', (GuildMember) => class SkyraGuildMember extends GuildMember {

	public settings: MemberSettings = new MemberSettings(this);

});

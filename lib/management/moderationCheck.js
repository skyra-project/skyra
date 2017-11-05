module.exports = (client, msg, moderator, target, i18n) => {
	if (target.id === msg.guild.ownerID) throw i18n.get('COMMAND_ROLE_HIGHER');
	if (target.id === moderator.id) throw i18n.get('COMMAND_USERSELF');
	if (target.id === client.user.id) throw i18n.get('COMMAND_TOSKYRA');
	const targetHighestRole = target.highestRole.position;
	if (targetHighestRole >= moderator.highestRole.position) throw i18n.get('COMMAND_ROLE_HIGHER');
	if (targetHighestRole >= msg.guild.me.highestRole.position) throw i18n.get('COMMAND_ROLE_HIGHER_SKYRA');
};

module.exports = (msg) => {
    const announcementID = msg.guild.settings.roles.subscriber;
    if (announcementID === null) throw msg.language.get('COMMAND_SUBSCRIBE_NO_ROLE');

    const role = msg.guild.roles.get(announcementID);
    if (!role) throw msg.language.get('COMMAND_SUBSCRIBE_NO_ROLE');

    if (role.position >= msg.guild.me.highestRole.position) throw msg.language.get('SYSTEM_HIGHEST_ROLE');
    return role;
};

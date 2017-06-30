exports.conf = {
  enabled: true,
  spamProtection: false,
  priority: 6,
};

exports.run = (client, msg, cmd) => {
  if (!cmd.conf.requiredSettings || cmd.conf.requiredSettings.length === 0) return false;
  const settings = cmd.conf.requiredSettings.filter(setting => !msg.guildSettings[setting]);
  if (settings.length > 0) return `The guild is missing the **${settings.join(", ")}** guild setting${settings.length > 1 ? "s" : ""} and cannot run.`;
  return false;
};

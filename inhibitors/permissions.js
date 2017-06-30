exports.conf = {
  enabled: true,
  spamProtection: false,
  priority: 10,
};

exports.run = (client, msg, cmd) => {
  const res = client.funcs.checkPerms(client, msg, cmd.conf.permLevel);
  if (res === null) return true;
  else if (!res) return "You do not have permission to use this command.";
  return false;
};

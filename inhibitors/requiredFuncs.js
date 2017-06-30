exports.conf = {
  enabled: true,
  spamProtection: false,
  priority: 6,
};

/* eslint-disable no-prototype-builtins */
exports.run = (client, msg, cmd) => {
  if (!cmd.conf.requiredFuncs || cmd.conf.requiredFuncs.length === 0) return false;
  const funcs = cmd.conf.requiredFuncs.filter(func => !client.funcs.hasOwnProperty(func));
  if (funcs.length > 0) return `The client is missing the **${funcs.join(", ")}** function${funcs.length > 1 ? "s" : ""} and cannot run.`;
  return false;
};

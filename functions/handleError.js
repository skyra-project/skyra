module.exports = (client, msg, error) => {
  if (client.debugMode && msg.author.id === "242043489611808769") return msg.error(error.stack || error.message || error);
  return msg.error(error.message || error);
};

module.exports = (client, msg, error) => {
  if (client.debugMode && msg.author.id === "242043489611808769") msg.error(error.stack || error.message || error);
  else msg.error(error.message || error);
};

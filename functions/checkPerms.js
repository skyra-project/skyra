module.exports = (client, msg, min) => {
  for (let i = min; i < 11; i++) {
    if (client.permStructure[i].check(client, msg)) return true;
    if (client.permStructure[i].break) return false;
  }
  return null;
};

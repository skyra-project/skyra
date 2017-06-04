exports.run = client => client.user.setGame("Skyra, help").catch(e => client.emit("log", e, "error"));

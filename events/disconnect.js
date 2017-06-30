exports.run = (client, err) => client.emit("log", `Disconnected | ${err.code}: ${err.reason}`, "error");

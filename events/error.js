exports.run = (client, err) => client.emit("log", err, "error");

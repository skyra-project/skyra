exports.run = (client, old, msg) => {
    if (old.content !== msg.content) client.emit('message', msg);
};

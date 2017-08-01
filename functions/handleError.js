module.exports = (client, msg, error) => {
    if (!error) return null;
    if (typeof error === 'string') return msg.alert(`Dear ${msg.author}, ${error}`);
    if (error.stack && client.debugMode && msg.author.id === '242043489611808769') error = error.stack;
    else error = error.message || error;
    return msg.error(error);
};

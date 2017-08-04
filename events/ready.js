exports.run = client => client.user.setGame('Skyra, help').catch(err => client.emit('log', err, 'error'));

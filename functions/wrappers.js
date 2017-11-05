const snekie = require('snekfetch');

exports.fetchAvatar = (user, size = 512) => {
	const url = user.avatar ? user.avatarURL({ format: 'png', size }) : user.defaultAvatarURL;
	return snekie.get(url).then(data => data.body).catch((err) => { throw `Could not download the profile avatar: ${err}`; });
};

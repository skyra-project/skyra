import { Client } from 'klasa';

export default Client.defaultUserSchema
	.add('commandUses', 'Integer', { 'default': 0, 'configurable': false })
	.add('badgeList', 'String', { array: true, configurable: false })
	.add('badgeSet', 'String', { array: true, configurable: false })
	.add('bannerList', 'String', { array: true, configurable: false })
	.add('color', 'String', { configurable: false })
	.add('marry', 'User', { configurable: false })
	.add('money', 'Float', { 'default': 0, 'min': 0, 'max': 2147483647, 'configurable': false })
	.add('points', 'Float', { 'default': 0, 'min': 0, 'max': 2147483647, 'configurable': false })
	.add('reputation', 'Integer', { 'default': 0, 'min': 0, 'max': 32767, 'configurable': false })
	.add('themeLevel', 'String', { 'default': '1001', 'configurable': false })
	.add('themeProfile', 'String', { 'default': '0001', 'configurable': false })
	.add('timeDaily', 'Integer', { 'default': 0, 'configurable': false })
	.add('timeReputation', 'Integer', { 'default': 0, 'configurable': false });

import { Canvas } from 'canvas-constructor';
import { join } from 'path';
import { assetsFolder } from '../util/constants';

export default Canvas
	.registerFont(join(assetsFolder, 'fonts', 'Roboto-Regular.ttf'), 'RobotoRegular')
	.registerFont(join(assetsFolder, 'fonts', 'NotoEmoji.ttf'), 'RobotoRegular')
	.registerFont(join(assetsFolder, 'fonts', 'NotoSans-Regular.ttf'), 'RobotoRegular')
	.registerFont(join(assetsFolder, 'fonts', 'Roboto-Light.ttf'), 'RobotoLight')
	.registerFont(join(assetsFolder, 'fonts', 'Family-Friends.ttf'), 'FamilyFriends');

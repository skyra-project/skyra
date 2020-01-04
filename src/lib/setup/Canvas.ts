import { assetsFolder } from '@utils/constants';
import { Canvas } from 'canvas-constructor';
import { join } from 'path';

export default Canvas
	.registerFont(join(assetsFolder, 'fonts', 'Roboto-Regular.ttf'), 'RobotoRegular')
	.registerFont(join(assetsFolder, 'fonts', 'NotoEmoji.ttf'), 'RobotoRegular')
	.registerFont(join(assetsFolder, 'fonts', 'NotoSans-Regular.ttf'), 'RobotoRegular')
	.registerFont(join(assetsFolder, 'fonts', 'Roboto-Light.ttf'), 'RobotoLight')
	.registerFont(join(assetsFolder, 'fonts', 'Family-Friends.ttf'), 'FamilyFriends');

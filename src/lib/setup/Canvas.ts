import { assetsFolder } from '#utils/constants';
import { loadFont } from 'canvas-constructor/skia';
import { join } from 'node:path';

loadFont('RobotoRegular', [
	join(assetsFolder, 'fonts', 'Roboto-Regular.ttf'),
	join(assetsFolder, 'fonts', 'NotoEmoji.ttf'),
	join(assetsFolder, 'fonts', 'NotoSans-Regular.ttf')
]);
loadFont('RobotoLight', [join(assetsFolder, 'fonts', 'Roboto-Light.ttf')]);
loadFont('FamilyFriends', [join(assetsFolder, 'fonts', 'Family-Friends.ttf')]);

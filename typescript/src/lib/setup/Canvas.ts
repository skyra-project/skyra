import { assetsFolder } from '#utils/constants';
import { join } from 'path';
import { FontLibrary } from 'skia-canvas';

FontLibrary.use('RobotoRegular', [
	join(assetsFolder, 'fonts', 'Roboto-Regular.ttf'),
	join(assetsFolder, 'fonts', 'NotoEmoji.ttf'),
	join(assetsFolder, 'fonts', 'NotoSans-Regular.ttf')
]);

FontLibrary.use('RobotoLight', [join(assetsFolder, 'fonts', 'Roboto-Light.ttf')]);
FontLibrary.use('FamilyFriends', [join(assetsFolder, 'fonts', 'Family-Friends.ttf')]);

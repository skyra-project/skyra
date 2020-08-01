import { assetsFolder } from '@utils/constants';
import { registerFont } from 'canvas';
import { join } from 'path';

registerFont(join(assetsFolder, 'fonts', 'Roboto-Regular.ttf'), { family: 'RobotoRegular' });
registerFont(join(assetsFolder, 'fonts', 'NotoEmoji.ttf'), { family: 'RobotoRegular' });
registerFont(join(assetsFolder, 'fonts', 'NotoSans-Regular.ttf'), { family: 'RobotoRegular' });
registerFont(join(assetsFolder, 'fonts', 'Roboto-Light.ttf'), { family: 'RobotoLight' });
registerFont(join(assetsFolder, 'fonts', 'Family-Friends.ttf'), { family: 'FamilyFriends' });

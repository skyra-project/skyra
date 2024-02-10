import { AppDataConfig } from '#lib/database/database.config';
import { rootFolder } from '#utils/constants';
import { setup } from '@skyra/env-utilities';
import { join } from 'node:path';

setup(join(rootFolder, 'src', '.env'));

export default AppDataConfig;

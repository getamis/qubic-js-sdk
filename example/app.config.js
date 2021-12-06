import dotenv from 'dotenv';
import path from 'path';

export default {
  extra: {
    ...dotenv.config({
      path: path.resolve(__dirname, '..', '.env'),
    }).parsed,
  },
};

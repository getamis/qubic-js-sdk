import dotenv from 'dotenv';

export default {
  extra: {
    ...dotenv.config().parsed,
  },
};

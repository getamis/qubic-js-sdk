const fs = require('fs');
const path = require('path');
const process = require('process');

const ENV_FILE_NAME = '.env';

const envFilePath = path.join(__dirname, '..', '..', ENV_FILE_NAME);

if (!fs.existsSync(ENV_FILE_NAME)) {
  if (!process.env.API_KEY) {
    console.error('createEnvFile error! Please set env API_KEY first');
    process.exit(1);
  }

  if (!process.env.API_KEY) {
    console.error('createEnvFile error! Please set env API_SECRET first');
    process.exit(1);
  }

  console.log('Creating .env file');
  let fileContent = '';
  fileContent += `API_KEY=${process.env.API_KEY}\n`;
  fileContent += `API_SECRET=${process.env.API_SECRET}\n`;
  fs.writeFileSync(envFilePath, fileContent);
} else {
  console.log('Found .env file, skip creating .env file');
}

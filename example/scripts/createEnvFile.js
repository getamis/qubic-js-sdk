const fs = require('fs');
const path = require('path');

const ENV_FILE_NAME = '.env';

const envFilePath = path.join(__dirname, '..', '..', ENV_FILE_NAME);

if (!fs.existsSync(ENV_FILE_NAME)) {
  console.log('Creating .env file');
  let fileContent = '';
  fileContent += `API_KEY=${process.env.API_KEY}\n`;
  fileContent += `API_SECRET=${process.env.API_SECRET}\n`;
  fs.writeFileSync(envFilePath, fileContent);
}

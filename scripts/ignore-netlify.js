/* eslint-disable no-console */
// https://docs.netlify.com/build/configure-builds/ignore-builds/

// An exit code of 1 indicates the contents have changed and the build process continues as usual.
// An exit code of 0 indicates that there are no changes and the build should stop.

const CONTINUED = 1;
const STOPPED = 0;

console.log('🚨 IGNORE SCRIPT RUNNING 🚨');

const context = process.env.CONTEXT;
if (context === 'deploy-preview') {
  console.log('🟢 Deploy preview context, proceeding with build.');
  process.exit(CONTINUED);
}

// when push a tag and trigger  a build
// netlify will treat tag as a branch
const tag = process.env.BRANCH || '';

const isValidTag = /^(v)?\d+\.\d+\.\d+(-(alpha|hotfix)\.\d+)?$/.test(tag);

if (isValidTag) {
  console.log(`✅ Tag ${tag} matched, proceeding with build.`);
  process.exit(CONTINUED);
} else {
  console.log(`❌ No matching tag (found: "${tag}"), skipping build.`);
  process.exit(STOPPED);
}

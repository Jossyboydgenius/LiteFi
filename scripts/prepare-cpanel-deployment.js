const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create deployment directory
const deployDir = path.join(__dirname, '..', 'cpanel-deployment');

if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true, force: true });
}
fs.mkdirSync(deployDir, { recursive: true });

console.log('Creating cPanel deployment package...');

// Copy standalone build
const standaloneDir = path.join(__dirname, '..', '.next', 'standalone');
if (fs.existsSync(standaloneDir)) {
  console.log('Copying standalone build...');
  execSync(`cp -r "${standaloneDir}"/* "${deployDir}"/`);
} else {
  console.error('Standalone build not found. Please run npm run build first.');
  process.exit(1);
}

// Copy static assets
const staticDir = path.join(__dirname, '..', '.next', 'static');
if (fs.existsSync(staticDir)) {
  console.log('Copying static assets...');
  const deployStaticDir = path.join(deployDir, '.next', 'static');
  fs.mkdirSync(path.dirname(deployStaticDir), { recursive: true });
  execSync(`cp -r "${staticDir}" "${deployStaticDir}"`);
}

// Copy environment files
console.log('Copying environment configuration...');
const envFiles = ['.env', '.env.local', '.env.production'];
envFiles.forEach(envFile => {
  const envPath = path.join(__dirname, '..', envFile);
  if (fs.existsSync(envPath)) {
    execSync(`cp "${envPath}" "${deployDir}"/`);
    console.log(`Copied ${envFile}`);
  }
});

// Copy package.json and package-lock.json
console.log('Copying package files...');
const packageFiles = ['package.json', 'package-lock.json'];
packageFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    execSync(`cp "${filePath}" "${deployDir}"/`);
  }
});

// Copy Prisma schema
console.log('Copying Prisma schema...');
const prismaDir = path.join(__dirname, '..', 'prisma');
if (fs.existsSync(prismaDir)) {
  execSync(`cp -r "${prismaDir}" "${deployDir}"/`);
}

// Create deployment instructions
const instructions = `# cPanel Deployment Instructions

## Files included in this deployment package:
- Standalone Next.js application (server.js)
- Static assets (.next/static)
- Public files (public/)
- Environment configuration (.env files)
- Prisma schema and migrations
- Package files for dependencies

## Deployment Steps:

1. Upload all files to your cPanel file manager or via FTP
2. Install Node.js dependencies:
   \`\`\`
   npm install --production
   \`\`\`

3. Set up environment variables in cPanel:
   - Copy contents from .env file to cPanel environment variables
   - Ensure DATABASE_URL points to your cPanel PostgreSQL database

4. Run database migrations:
   \`\`\`
   npx prisma migrate deploy
   \`\`\`

5. Start the application:
   \`\`\`
   node server.js
   \`\`\`

## Important Notes:
- The application will run on the port specified in the PORT environment variable
- Make sure your cPanel hosting supports Node.js applications
- Ensure PostgreSQL database is accessible from your hosting environment
- Update any domain-specific configurations in your environment variables

## File Structure:
- server.js - Main application server
- public/ - Static public assets
- .next/static/ - Next.js static assets
- prisma/ - Database schema and migrations
- package.json - Dependencies list
`;

fs.writeFileSync(path.join(deployDir, 'DEPLOYMENT_INSTRUCTIONS.md'), instructions);

// Create a simple start script for cPanel
const startScript = `#!/bin/bash
# cPanel Start Script
echo "Starting LiteFi Application..."
PORT=\${PORT:-3000} node server.js
`;

fs.writeFileSync(path.join(deployDir, 'start.sh'), startScript);
execSync(`chmod +x "${path.join(deployDir, 'start.sh')}"`); 

console.log('\n✅ cPanel deployment package created successfully!');
console.log(`📁 Location: ${deployDir}`);
console.log('📋 See DEPLOYMENT_INSTRUCTIONS.md for deployment steps');
console.log('\n🚀 Ready to upload to cPanel!');
#!/usr/bin/env node

/**
 * Constant Contact OAuth2 Setup Script
 *
 * This script helps you obtain an initial refresh token for Constant Contact API
 * using the Authorization Code Flow with PKCE.
 *
 * Prerequisites:
 * 1. Create an app at: https://app.constantcontact.com/pages/dma/portal/
 * 2. Select "Authorization Code Flow and Implicit Flow"
 * 3. Select "Rotating Refresh Tokens"
 * 4. Set Redirect URI to: http://localhost:3000/auth/constant-contact/callback
 * 5. Get your Client ID and Client Secret
 *
 * Usage:
 * node scripts/setup-constant-contact-oauth.js
 */

const http = require('http');
const url = require('url');
const crypto = require('crypto');
const { exec } = require('child_process');

const PORT = 3456;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    process.stdout.write(`${colors.cyan}${question}${colors.reset} `);
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim());
    });
  });
}

// Generate random state for OAuth2 security
function generateRandomString(length) {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}

// Exchange authorization code for tokens
async function exchangeCodeForTokens(code, clientId, clientSecret) {
  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://authz.constantcontact.com/oauth2/default/v1/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// Main setup function
async function setup() {
  log('\n========================================', colors.bright);
  log('  Constant Contact OAuth2 Setup', colors.bright);
  log('========================================\n', colors.bright);

  log('This script will help you get your OAuth2 tokens for Constant Contact.\n');

  // Get Client ID and Secret from user
  const clientId = await prompt('Enter your Constant Contact Client ID (API Key):');
  const clientSecret = await prompt('Enter your Constant Contact Client Secret:');

  if (!clientId || !clientSecret) {
    log('\n❌ Error: Client ID and Secret are required!', colors.yellow);
    process.exit(1);
  }

  const state = generateRandomString(32);

  log('\n' + '='.repeat(50), colors.blue);
  log('📋 BEFORE YOU CONTINUE - IMPORTANT!', colors.bright);
  log('='.repeat(50), colors.blue);
  log('\nIn your Constant Contact app settings, make sure you have added this Redirect URI:\n');
  log(`  ${REDIRECT_URI}`, colors.green);
  log('\nPath: My Applications > Your App > OAuth2 Settings > Redirect URI(s)\n');

  await prompt('Press Enter when you have added the redirect URI...');

  // Build authorization URL
  const authUrl = new URL('https://authz.constantcontact.com/oauth2/default/v1/authorize');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', 'contact_data offline_access'); // offline_access is required for refresh tokens
  authUrl.searchParams.append('state', state);

  log('\n🌐 Opening authorization page in your browser...', colors.cyan);
  log('If it doesn\'t open automatically, visit this URL:\n');
  log(`  ${authUrl.toString()}\n`, colors.blue);

  // Start local server to receive callback
  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (parsedUrl.pathname === '/callback') {
      const { code, state: returnedState, error, error_description } = parsedUrl.query;

      if (error) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head><title>Authorization Failed</title></head>
            <body>
              <h1>❌ Authorization Failed</h1>
              <p><strong>Error:</strong> ${error}</p>
              <p><strong>Description:</strong> ${error_description || 'No description provided'}</p>
              <p>You can close this window and try again.</p>
            </body>
          </html>
        `);
        log(`\n❌ Authorization failed: ${error} - ${error_description}`, colors.yellow);
        server.close();
        process.exit(1);
        return;
      }

      if (returnedState !== state) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head><title>Security Error</title></head>
            <body>
              <h1>❌ Security Error</h1>
              <p>State mismatch. This could be a security issue.</p>
              <p>You can close this window and try again.</p>
            </body>
          </html>
        `);
        log('\n❌ Security error: State mismatch!', colors.yellow);
        server.close();
        process.exit(1);
        return;
      }

      try {
        log('\n🔄 Exchanging authorization code for tokens...', colors.cyan);

        const tokens = await exchangeCodeForTokens(code, clientId, clientSecret);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head><title>Success!</title></head>
            <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
              <h1 style="color: #10b981;">✅ Success!</h1>
              <p>Authorization successful! Check your terminal for the tokens.</p>
              <p>You can close this window.</p>
            </body>
          </html>
        `);

        log('\n' + '='.repeat(50), colors.green);
        log('✅ SUCCESS! OAuth2 Tokens Retrieved', colors.bright);
        log('='.repeat(50) + '\n', colors.green);

        // Debug: Show full response
        log('📋 Full Token Response:', colors.cyan);
        log(JSON.stringify(tokens, null, 2) + '\n', colors.reset);

        if (!tokens.refresh_token) {
          log('⚠️  WARNING: No refresh token received!', colors.yellow);
          log('This likely means your app settings are incorrect.\n', colors.yellow);
          log('Please check that you selected:', colors.bright);
          log('  ✅ "Authorization Code Flow and Implicit Flow"', colors.reset);
          log('  ✅ "Rotating Refresh Tokens"\n', colors.reset);
          log('Then try again.\n', colors.yellow);
        }

        log('Add these to your .env file:\n', colors.bright);
        log(`CONSTANT_CONTACT_CLIENT_ID=${clientId}`, colors.green);
        log(`CONSTANT_CONTACT_CLIENT_SECRET=${clientSecret}`, colors.green);
        log(`CONSTANT_CONTACT_REFRESH_TOKEN=${tokens.refresh_token || 'NOT_RECEIVED - CHECK SETTINGS'}`, colors.green);

        if (tokens.refresh_token) {
          log('\n⚠️  Important Notes:', colors.yellow);
          log('   - The refresh token is what you need to store permanently', colors.reset);
          log('   - Access tokens expire, but are automatically refreshed', colors.reset);
          log('   - With rotating tokens, watch server logs for token updates\n', colors.reset);
        }

        server.close();
        setTimeout(() => process.exit(0), 100);
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head><title>Token Exchange Failed</title></head>
            <body>
              <h1>❌ Token Exchange Failed</h1>
              <p>${error.message}</p>
              <p>You can close this window and check the terminal for details.</p>
            </body>
          </html>
        `);
        log(`\n❌ Token exchange error: ${error.message}`, colors.yellow);
        server.close();
        process.exit(1);
      }
    }
  });

  server.listen(PORT, () => {
    log(`\n✓ Local server started on port ${PORT}`, colors.green);

    // Try to open browser (works on macOS, Linux, Windows)
    const url = authUrl.toString();
    let command;

    switch (process.platform) {
      case 'darwin': // macOS
        command = `open "${url}"`;
        break;
      case 'win32': // Windows
        command = `start "" "${url}"`;
        break;
      default: // Linux and others
        command = `xdg-open "${url}"`;
    }

    exec(command, (error) => {
      if (error) {
        log('⚠️  Could not open browser automatically. Please copy the URL above.', colors.yellow);
      }
    });
  });
}

// Run setup
setup().catch((error) => {
  log(`\n❌ Setup error: ${error.message}`, colors.yellow);
  process.exit(1);
});
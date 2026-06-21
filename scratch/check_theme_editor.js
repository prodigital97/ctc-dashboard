require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');

const wpUrl = process.env.WP_URL || 'https://classytravelcouples.com';
const wpUsername = process.env.WP_USERNAME || 'duttapronoy97@gmail.com';
const wpPassword = process.env.WP_APPLICATION_PASSWORD || 'Sajal@25021997';

async function checkThemeEditor() {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  const loginUrl = `${cleanWpUrl}/wp-login.php`;
  
  console.log('[Theme Editor Check] Logging in...');
  const loginParams = new URLSearchParams();
  loginParams.append('log', wpUsername);
  loginParams.append('pwd', wpPassword);
  loginParams.append('wp-submit', 'Log In');
  loginParams.append('redirect_to', `${cleanWpUrl}/wp-admin/`);
  loginParams.append('testcookie', '1');

  let loginResponse = await fetch(loginUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: loginParams.toString(),
    redirect: 'manual'
  });

  const cookies = [];
  const setCookieHeaders = loginResponse.headers.getSetCookie();
  if (setCookieHeaders && setCookieHeaders.length > 0) {
    setCookieHeaders.forEach(c => {
      cookies.push(c.split(';')[0]);
    });
  }
  const cookieHeader = cookies.join('; ');

  console.log('[Theme Editor Check] Fetching theme-editor.php...');
  const editorUrl = `${cleanWpUrl}/wp-admin/theme-editor.php?file=style.css&theme=astra-child-ctc`;
  const response = await fetch(editorUrl, {
    headers: { 'Cookie': cookieHeader }
  });

  const text = await response.text();
  if (text.includes('Theme Editor') || text.includes('Edit Themes') || text.includes('theme-editor.php')) {
    console.log('[Theme Editor Check] Theme File Editor is ENABLED!');
    
    // Check if the form and nonce are present
    const nonceMatch = text.match(/id="_wpnonce"\s+name="_wpnonce"\s+value="([a-f0-9]+)"/i) || text.match(/name="_wpnonce"\s+value="([a-f0-9]+)"/i);
    if (nonceMatch) {
      console.log(`[Theme Editor Check] Found edit nonce: ${nonceMatch[1]}`);
    } else {
      console.log('[Theme Editor Check] Nonce not found in editor HTML.');
    }
  } else {
    console.log('[Theme Editor Check] Theme File Editor is DISABLED (probably DISALLOW_FILE_EDIT is set in wp-config.php).');
    fs.writeFileSync('editor_response.html', text);
    console.log('Saved response to editor_response.html');
  }
}

checkThemeEditor();

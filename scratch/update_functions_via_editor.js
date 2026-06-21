require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');

const wpUrl = process.env.WP_URL || 'https://classytravelcouples.com';
const wpUsername = process.env.WP_USERNAME || 'duttapronoy97@gmail.com';
const wpPassword = process.env.WP_APPLICATION_PASSWORD || 'Sajal@25021997';

async function updateFunctionsViaEditor() {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  const loginUrl = `${cleanWpUrl}/wp-login.php`;
  const theme = 'astra-child-ctc';
  const file = 'functions.php';
  const editorUrl = `${cleanWpUrl}/wp-admin/theme-editor.php?file=${file}&theme=${theme}`;

  console.log('[Theme Editor API] 1. Logging in...');
  const loginParams = new URLSearchParams();
  loginParams.append('log', wpUsername);
  loginParams.append('pwd', wpPassword);
  loginParams.append('wp-submit', 'Log In');
  loginParams.append('redirect_to', `${cleanWpUrl}/wp-admin/`);
  loginParams.append('testcookie', '1');

  const loginResponse = await fetch(loginUrl, {
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
  if (!cookieHeader.includes('wordpress_logged_in')) {
    console.error('Failed to log in.');
    return;
  }
  console.log('[Theme Editor API] Login successful.');

  console.log('[Theme Editor API] 2. Fetching theme-editor.php to extract nonce...');
  const editorPageRes = await fetch(editorUrl, { headers: { 'Cookie': cookieHeader } });
  const html = await editorPageRes.text();
  
  const nonceMatch = html.match(/id="nonce"\s+name="nonce"\s+value="([a-f0-9]+)"/i) || html.match(/name="nonce"\s+value="([a-f0-9]+)"/i);
  if (!nonceMatch) {
    console.error('Failed to find theme editor nonce. Check theme editor status or file access.');
    fs.writeFileSync('editor_response_functions.html', html);
    return;
  }
  const editNonce = nonceMatch[1];
  console.log(`[Theme Editor API] Found edit nonce: ${editNonce}`);

  // Load the local functions.php content
  const phpPath = path.join(__dirname, '..', 'astra-child-ctc', 'functions.php');
  const phpContent = fs.readFileSync(phpPath, 'utf8');

  console.log('[Theme Editor API] 3. Saving updated functions.php...');
  
  const formParams = new URLSearchParams();
  formParams.append('nonce', editNonce);
  formParams.append('_wp_http_referer', `/wp-admin/theme-editor.php?file=${file}&theme=${theme}&scrollto=0`);
  formParams.append('theme', theme);
  formParams.append('file', file);
  formParams.append('newcontent', phpContent);
  formParams.append('action', 'update');
  formParams.append('submit', 'Update File');

  const updateRes = await fetch(`${cleanWpUrl}/wp-admin/theme-editor.php`, {
    method: 'POST',
    headers: {
      'Cookie': cookieHeader,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formParams.toString()
  });

  const updateText = await updateRes.text();
  if (updateText.includes('File edited successfully') || updateText.includes('file-edited-successfully') || updateText.includes('File edited')) {
    console.log('[Theme Editor API] Success! functions.php updated successfully on the live site.');
  } else {
    console.error('[Theme Editor API] Failed to update file. Checking error...');
    const errorMatch = updateText.match(/<div id="message" class="[^"]*error[^"]*">([\s\S]*?)<\/div>/i);
    if (errorMatch) {
      console.log('Error Message:', errorMatch[1].replace(/<[^>]*>/g, '').trim());
    } else {
      console.log('Response did not report success. Check editor_functions_result.html for details.');
      fs.writeFileSync('editor_functions_result.html', updateText);
    }
  }
}

updateFunctionsViaEditor();

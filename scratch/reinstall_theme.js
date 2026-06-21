require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');

const wpUrl = process.env.WP_URL || 'https://classytravelcouples.com';
const wpUsername = process.env.WP_USERNAME || 'duttapronoy97@gmail.com';
const wpPassword = process.env.WP_APPLICATION_PASSWORD || 'Sajal@25021997';

const zipPath = path.join(__dirname, '..', 'astra-child-ctc-1.zip');
const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
const authHeader = `Basic ${base64Auth}`;

async function runReinstall() {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  
  // Step 1: Temporarily activate "astra" parent theme
  console.log('[Theme Reinstaller] 1. Activating parent theme "astra" temporarily...');
  const activeRes1 = await fetch(`${cleanWpUrl}/wp-json/elementor-one/v1/themes/astra/activate`, {
    method: 'POST',
    headers: { 'Authorization': authHeader }
  });
  if (activeRes1.ok) {
    console.log('[Theme Reinstaller] Parent theme active.');
  } else {
    console.warn('[Theme Reinstaller] Warning: Could not activate parent theme (it might already be active or failed):', await activeRes1.text());
  }

  // Step 2: Upload theme zip (overwrite)
  console.log('[Theme Reinstaller] 2. Logging in for theme upload...');
  const loginUrl = `${cleanWpUrl}/wp-login.php`;
  const uploadPageUrl = `${cleanWpUrl}/wp-admin/theme-install.php?tab=upload`;
  const updateUrl = `${cleanWpUrl}/wp-admin/update.php?action=upload-theme`;

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
    console.error('Failed to log in for upload.');
    return;
  }
  console.log('[Theme Reinstaller] Login successful.');

  console.log('[Theme Reinstaller] Fetching upload page for nonce...');
  const pageResponse = await fetch(uploadPageUrl, { headers: { 'Cookie': cookieHeader } });
  const uploadPageText = await pageResponse.text();
  const nonceMatch = uploadPageText.match(/name="_wpnonce"\s+value="([a-f0-9]+)"/i);
  if (!nonceMatch) {
    console.error('Failed to parse nonce.');
    return;
  }
  const uploadNonce = nonceMatch[1];
  console.log('[Theme Reinstaller] Nonce:', uploadNonce);

  console.log('[Theme Reinstaller] Uploading ZIP file...');
  const zipBuffer = fs.readFileSync(zipPath);
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const parts = [
    `--${boundary}\r\nContent-Disposition: form-data; name="_wpnonce"\r\n\r\n${uploadNonce}\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="_wp_http_referer"\r\n\r\n/wp-admin/theme-install.php?tab=upload\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="installtheme-upload-submit"\r\n\r\nInstall Now\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="themezip"; filename="astra-child-ctc-1.zip"\r\nContent-Type: application/x-zip-compressed\r\n\r\n`
  ];
  const buffers = [];
  parts.forEach((part, i) => {
    buffers.push(Buffer.from(part, 'utf8'));
    if (i === 3) {
      buffers.push(zipBuffer);
      buffers.push(Buffer.from('\r\n', 'utf8'));
    }
  });
  buffers.push(Buffer.from(`--${boundary}--\r\n`, 'utf8'));
  const bodyBuffer = Buffer.concat(buffers);

  const uploadRes = await fetch(updateUrl, {
    method: 'POST',
    headers: {
      'Cookie': cookieHeader,
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    },
    body: bodyBuffer
  });
  const uploadResponseText = await uploadRes.text();

  if (uploadResponseText.includes('Theme installed successfully')) {
    console.log('[Theme Reinstaller] Theme uploaded successfully (fresh install).');
  } else if (uploadResponseText.includes('overwrite=update-theme') || uploadResponseText.includes('update-from-upload-overwrite')) {
    console.log('[Theme Reinstaller] Theme exists. Overwriting theme...');
    const linkMatch = uploadResponseText.match(/update\.php\?action=upload-theme&amp;package=(\d+)&amp;overwrite=update-theme&amp;_wpnonce=([a-f0-9]+)/i);
    if (!linkMatch) {
      console.error('Failed to parse overwrite link.');
      return;
    }
    const packageId = linkMatch[1];
    const overwriteNonce = linkMatch[2];
    const confirmUrl = `${cleanWpUrl}/wp-admin/update.php?action=upload-theme&package=${packageId}&overwrite=update-theme&_wpnonce=${overwriteNonce}`;
    
    console.log('[Theme Reinstaller] Confirming overwrite...');
    const confirmRes = await fetch(confirmUrl, { headers: { 'Cookie': cookieHeader } });
    const confirmText = await confirmRes.text();
    if (confirmText.includes('Theme updated successfully') || confirmText.includes('Theme updated')) {
      console.log('[Theme Reinstaller] Theme updated and replaced successfully!');
    } else {
      console.error('[Theme Reinstaller] Failed to overwrite theme.');
      fs.writeFileSync('confirm_err.html', confirmText);
      return;
    }
  } else {
    console.error('[Theme Reinstaller] Theme upload failed.');
    fs.writeFileSync('upload_err.html', uploadResponseText);
    return;
  }

  // Step 3: Reactivate "astra-child-ctc"
  console.log('[Theme Reinstaller] 3. Re-activating child theme "astra-child-ctc"...');
  const activeRes2 = await fetch(`${cleanWpUrl}/wp-json/elementor-one/v1/themes/astra-child-ctc/activate`, {
    method: 'POST',
    headers: { 'Authorization': authHeader }
  });
  const activeText2 = await activeRes2.text();
  console.log('[Theme Reinstaller] Active response:', activeText2);
}

runReinstall();

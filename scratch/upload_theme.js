require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');

const wpUrl = process.env.WP_URL || 'https://classytravelcouples.com';
const wpUsername = process.env.WP_USERNAME || 'duttapronoy97@gmail.com';
const wpPassword = process.env.WP_APPLICATION_PASSWORD || 'Sajal@25021997';

const zipPath = path.join(__dirname, '..', 'astra-child-ctc-1.zip');

if (!fs.existsSync(zipPath)) {
  console.error('Error: astra-child-ctc-1.zip not found!');
  process.exit(1);
}

async function uploadTheme() {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  const loginUrl = `${cleanWpUrl}/wp-login.php`;
  const uploadPageUrl = `${cleanWpUrl}/wp-admin/theme-install.php?tab=upload`;
  const updateUrl = `${cleanWpUrl}/wp-admin/update.php?action=upload-theme`;

  console.log(`[WP Loader] 1. Logging in to: ${loginUrl}...`);
  
  const loginParams = new URLSearchParams();
  loginParams.append('log', wpUsername);
  loginParams.append('pwd', wpPassword);
  loginParams.append('wp-submit', 'Log In');
  loginParams.append('redirect_to', `${cleanWpUrl}/wp-admin/`);
  loginParams.append('testcookie', '1');

  let loginResponse;
  try {
    loginResponse = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: loginParams.toString(),
      redirect: 'manual'
    });
  } catch (err) {
    console.error('Login request failed:', err.message);
    process.exit(1);
  }

  const cookies = [];
  const setCookieHeaders = loginResponse.headers.getSetCookie();
  if (setCookieHeaders && setCookieHeaders.length > 0) {
    setCookieHeaders.forEach(c => {
      const part = c.split(';')[0];
      cookies.push(part);
    });
  }

  const cookieHeader = cookies.join('; ');
  if (!cookieHeader.includes('wordpress_logged_in')) {
    console.error('Failed to log in. Please check credentials in .env.');
    process.exit(1);
  }
  console.log('[WP Loader] Login successful!');

  console.log('[WP Loader] 2. Fetching theme upload page to extract nonce...');
  let uploadPageText;
  try {
    const pageResponse = await fetch(uploadPageUrl, {
      headers: {
        'Cookie': cookieHeader
      }
    });
    if (!pageResponse.ok) {
      throw new Error(`HTTP ${pageResponse.status}`);
    }
    uploadPageText = await pageResponse.text();
  } catch (err) {
    console.error('Failed to fetch upload page:', err.message);
    process.exit(1);
  }

  const nonceMatch = uploadPageText.match(/name="_wpnonce"\s+value="([a-f0-9]+)"/i);
  if (!nonceMatch) {
    console.error('Failed to extract _wpnonce from upload page.');
    process.exit(1);
  }
  const uploadNonce = nonceMatch[1];
  console.log(`[WP Loader] Found upload nonce: ${uploadNonce}`);

  console.log('[WP Loader] 3. Uploading child theme zip...');
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

  let uploadResponseText;
  try {
    const uploadRes = await fetch(updateUrl, {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: bodyBuffer
    });
    uploadResponseText = await uploadRes.text();
  } catch (err) {
    console.error('Upload request failed:', err.message);
    process.exit(1);
  }

  if (uploadResponseText.includes('This theme is already installed') || uploadResponseText.includes('update-from-upload-overwrite') || uploadResponseText.includes('overwrite=update-theme')) {
    console.log('[WP Loader] 4. Theme already exists. Proceeding to replace theme...');

    const linkMatch = uploadResponseText.match(/update\.php\?action=upload-theme&amp;package=(\d+)&amp;overwrite=update-theme&amp;_wpnonce=([a-f0-9]+)/i);

    if (!linkMatch) {
      console.error('Failed to parse overwrite link from response.');
      fs.writeFileSync('response_err.html', uploadResponseText);
      console.log('Saved response to response_err.html');
      process.exit(1);
    }

    const packageId = linkMatch[1];
    const overwriteNonce = linkMatch[2];
    console.log(`[WP Loader] Package ID: ${packageId}`);
    console.log(`[WP Loader] Overwrite Nonce: ${overwriteNonce}`);

    const confirmUrl = `${cleanWpUrl}/wp-admin/update.php?action=upload-theme&package=${packageId}&overwrite=update-theme&_wpnonce=${overwriteNonce}`;
    console.log(`[WP Loader] Sending overwrite confirmation GET to: ${confirmUrl}`);

    let confirmResponseText;
    try {
      const confirmRes = await fetch(confirmUrl, {
        method: 'GET',
        headers: {
          'Cookie': cookieHeader
        }
      });
      confirmResponseText = await confirmRes.text();
    } catch (err) {
      console.error('Overwrite confirmation request failed:', err.message);
      process.exit(1);
    }

    if (confirmResponseText.includes('Theme updated successfully') || confirmResponseText.includes('Theme installed successfully') || confirmResponseText.includes('Theme updated')) {
      console.log('[WP Loader] Theme updated and replaced successfully on WordPress!');
    } else {
      console.error('Failed to replace theme. Overwrite confirmation output:');
      console.log(confirmResponseText.substring(0, 1500));
      fs.writeFileSync('confirm_err.html', confirmResponseText);
      console.log('Saved confirmation response to confirm_err.html');
      process.exit(1);
    }
  } else if (uploadResponseText.includes('Theme installed successfully')) {
    console.log('[WP Loader] Theme installed successfully on WordPress!');
  } else {
    console.error('Failed to install theme. Response output:');
    console.log(uploadResponseText.substring(0, 1500));
    fs.writeFileSync('upload_err.html', uploadResponseText);
    console.log('Saved upload response to upload_err.html');
    process.exit(1);
  }
}

uploadTheme();

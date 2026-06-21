async function testSearchRedirect() {
  const url = 'https://classytravelcouples.com/?s=sardine';
  console.log(`Fetching ${url} (manual redirect)...`);
  const res = await fetch(url, { redirect: 'manual' });
  console.log(`Status: ${res.status}`);
  console.log(`Location Header: ${res.headers.get('location')}`);

  console.log(`\nFetching ${url} (following redirects)...`);
  const resFollow = await fetch(url);
  console.log(`Final URL: ${resFollow.url}`);
  console.log(`Final Status: ${resFollow.status}`);
}

testSearchRedirect().catch(console.error);

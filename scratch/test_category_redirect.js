async function testRedirect() {
  const url = 'https://classytravelcouples.com/category/food-culinary/';
  console.log(`Fetching ${url} (manual redirect handling)...`);
  const res = await fetch(url, { redirect: 'manual' });
  console.log(`Status: ${res.status}`);
  console.log(`Location Header: ${res.headers.get('location')}`);

  console.log(`\nFetching ${url} (following redirects)...`);
  const resFollow = await fetch(url);
  console.log(`Final URL: ${resFollow.url}`);
  console.log(`Final Status: ${resFollow.status}`);
}

testRedirect().catch(console.error);

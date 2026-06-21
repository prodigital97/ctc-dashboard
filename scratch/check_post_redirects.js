async function checkPostRedirect() {
  const url1 = 'https://classytravelcouples.com/amphoras-rolling-hills-our-couples-guide-to-the-hidden-wine-regions-of-eastern-europe-2/';
  const url2 = 'https://classytravelcouples.com/amphoras-rolling-hills-our-couples-guide-to-the-hidden-wine-regions-of-eastern-europe/';

  console.log(`Requesting URL (following redirects): ${url1}`);
  const res1 = await fetch(url1);
  console.log(`Final URL 1: ${res1.url}`);
  console.log(`Status 1: ${res1.status}`);

  console.log(`\nRequesting URL (following redirects): ${url2}`);
  const res2 = await fetch(url2);
  console.log(`Final URL 2: ${res2.url}`);
  console.log(`Status 2: ${res2.status}`);
}

checkPostRedirect().catch(console.error);

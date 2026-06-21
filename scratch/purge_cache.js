async function purge() {
  const url = 'https://classytravelcouples.com/?purge_all_caches=1';
  console.log('Sending purge request to:', url);
  try {
    const res = await fetch(url);
    console.log('Purge response status:', res.status);
    console.log('Cache successfully purged!');
  } catch (e) {
    console.error('Error purging cache:', e.message);
  }
}

purge();

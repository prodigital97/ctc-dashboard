async function check() {
  try {
    const res = await fetch('http://localhost:3000/');
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body length:', text.length);
    console.log('Body preview:', text.substring(0, 500));
  } catch (e) {
    console.log('Error:', e.message);
  }
}
check();

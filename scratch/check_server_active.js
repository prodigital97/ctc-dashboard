async function check() {
  try {
    const res = await fetch('http://localhost:3000/api/config-status');
    console.log('Server is active! Status:', res.status);
    const data = await res.json();
    console.log('Config status:', data);
  } catch (e) {
    console.log('Server is NOT active (Connection refused/Error):', e.message);
  }
}
check();

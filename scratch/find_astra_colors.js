async function findAstraColors() {
  const url = 'https://classytravelcouples.com/faros-villas-serifos/';
  try {
    const res = await fetch(url);
    const html = await res.text();
    
    // Find the inline style tag containing the root variables
    const regex = /:root\s*\{[^}]*\}/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const varsBlock = match[0];
      if (varsBlock.includes('--ast-global-color-')) {
        console.log('Found root CSS variables block:');
        const vars = varsBlock.match(/--ast-global-color-\d+:[^;}]*;/gi);
        if (vars) {
          vars.forEach(v => console.log(' ', v.trim()));
        } else {
          console.log('No global colors matching regex inside :root block');
        }
      }
    }
  } catch (err) {
    console.error(err.message);
  }
}

findAstraColors();

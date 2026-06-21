async function run() {
  const url = 'https://classytravelcouples.com/?nocache=1';
  try {
    const res = await fetch(url);
    const html = await res.text();
    
    // Find the menu items
    const menuItems = [];
    const itemRegex = /<li[^>]*id=["']menu-item-\d+["'][^>]*>([\s\S]*?)<\/li>/gi;
    let match;
    while ((match = itemRegex.exec(html)) !== null) {
      const content = match[1];
      if (content.includes('href')) {
        menuItems.push(match[0]);
      }
    }
    
    console.log('=== Active Menu Items HTML ===');
    menuItems.forEach((item, idx) => {
      console.log(`Item ${idx + 1}:`, item.replace(/\s+/g, ' ').trim());
    });
  } catch (e) {
    console.error(e);
  }
}

run();

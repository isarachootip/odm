import * as fs from 'fs';

async function fetchImageForQuery(query: string) {
  const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    const html = await response.text();
    fs.writeFileSync('test_search.html', html);
    console.log("HTML saved to test_search.html");
    
    // Let's try to match img tags
    const imgMatches = html.match(/<img[^>]+src="([^">]+)"/g);
    if (imgMatches) {
        console.log("Found matches:", imgMatches.slice(0, 5));
    }
  } catch (error) {
    console.error(error);
  }
}

fetchImageForQuery("ข้าวกะเพราหมูสับ");

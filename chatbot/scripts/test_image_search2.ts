import * as fs from 'fs';

const html = fs.readFileSync('test_search.html', 'utf-8');
const imgMatches = html.match(/<img[^>]+src="([^">]+)"/g);
if (imgMatches) {
    console.log("Found matches:");
    imgMatches.forEach(m => console.log(m.substring(0, 100)));
} else {
    console.log("No images found.");
}

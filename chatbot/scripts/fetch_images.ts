import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchImageForQuery(query: string): Promise<string | null> {
  const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const html = await response.text();
    // Google image search usually has images under encrypted-tbn0.gstatic.com
    const match = html.match(/https:\/\/encrypted-tbn0\.gstatic\.com\/images\?q=[^"\s&]+/);
    if (match) {
      return match[0];
    }
    return null;
  } catch (error) {
    console.error(`Error fetching image for ${query}:`, error);
    return null;
  }
}

async function main() {
  const products = await prisma.product.findMany({});
  console.log(`Found ${products.length} products to update.`);

  for (const product of products) {
    console.log(`Fetching image for: ${product.name}`);
    const imageUrl = await fetchImageForQuery(product.name);
    
    if (imageUrl) {
      await prisma.product.update({
        where: { id: product.id },
        data: { images: [imageUrl] }
      });
      console.log(`✅ Updated ${product.name} with image: ${imageUrl}`);
    } else {
      console.log(`❌ Could not find image for ${product.name}`);
    }
    
    // delay to prevent getting blocked
    await delay(1000);
  }

  console.log('Finished updating product images.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

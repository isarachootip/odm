import { PrismaClient } from '@prisma/client';
import * as google from 'googlethis';

const prisma = new PrismaClient();

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const products = await prisma.product.findMany({});
  console.log(`Found ${products.length} products to update.`);

  for (const product of products) {
    if (product.images.length > 0 && !product.images[0].includes('google.com/search')) {
        console.log(`Skipping: ${product.name} (already has image)`);
        continue;
    }
    
    console.log(`Fetching image for: ${product.name}`);
    try {
        const images = await google.image(product.name, { safe: false });
        // Find a valid image URL
        const image = images.find(img => img.url && img.url.startsWith('https://'));
        
        if (image) {
          await prisma.product.update({
            where: { id: product.id },
            data: { images: [image.url] }
          });
          console.log(`✅ Updated ${product.name} with image: ${image.url.substring(0, 50)}...`);
        } else {
          console.log(`❌ Could not find image for ${product.name}`);
        }
    } catch(err) {
        console.error(`❌ Error fetching ${product.name}:`, err);
    }
    
    // delay to prevent getting blocked
    await delay(3000);
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

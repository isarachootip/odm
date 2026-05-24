import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const csvFilePath = path.join(__dirname, '../../products.csv');
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
  
  const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
  // Skip header
  const records = lines.slice(1);

  console.log(`Found ${records.length} records to import.`);

  for (const line of records) {
    const columns = line.split(',');
    if (columns.length >= 3) {
      const name = columns[1].trim();
      const imageUrl = columns[2].trim();

      await prisma.product.create({
        data: {
          name: name,
          price: 0,
          inventory: 100, // default inventory
          images: imageUrl ? [imageUrl] : [],
        }
      });
      console.log(`Imported: ${name}`);
    }
  }

  console.log('Import completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

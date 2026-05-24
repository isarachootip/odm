import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Force load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('DATABASE_URL is not defined in .env.local');
    process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const products = [
    // --- FOOD ZONE ---
    {
        name: "Classic Wagyu Ribeye",
        price: 1250,
        category: "Steakhouse",
        image: "https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&w=800&q=80",
        description: "A4 Grade Wagyu ribeye with marble score 7+, served with truffle salt.",
        zone: "food",
        tag: "Premium"
    },
    {
        name: "Premium Sushi Platter",
        price: 890,
        category: "Japanese",
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
        description: "Chef's selection of fresh Nigiri and Sashimi, flown from Tsukiji.",
        zone: "food",
        tag: "Fresh"
    },
    {
        name: "Truffle Pasta Carbonara",
        price: 450,
        category: "Italian",
        image: "https://images.unsplash.com/photo-1612450844944-1b2cab8aef00?auto=format&fit=crop&w=800&q=80",
        description: "Handmade tagliatelle with black truffle shavings and authentic guanciale.",
        zone: "food",
        tag: "Signature"
    },
    {
        name: "Authentic Pad Thai Goong",
        price: 220,
        category: "Thai",
        image: "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?auto=format&fit=crop&w=800&q=80",
        description: "Traditional street-style Pad Thai with jumbo river prawns.",
        zone: "food",
        tag: "Top Rated"
    },
    {
        name: "Matcha Lava Cake",
        price: 180,
        category: "Dessert",
        image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        description: "Warm ceremonial grade matcha cake with a molten center.",
        zone: "food",
        tag: "Sweet"
    },

    // --- MALL HUB ---
    {
        name: "iPhone 15 Pro Max",
        price: 48900,
        category: "Gadgets",
        image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=800&q=80",
        description: "Titanium design, A17 Pro chip, ultra-advanced 5G smartphone.",
        zone: "mall",
        tag: "Limited"
    },
    {
        name: "DJI Mavic 3 Pro",
        price: 75900,
        category: "Drones",
        image: "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&w=800&q=80",
        description: "Triple-camera system drone for professional cinematography.",
        zone: "mall",
        tag: "Pro"
    },
    {
        name: "Sony Alpha A7 IV",
        price: 82990,
        category: "Cameras",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
        description: "Full-frame mirrorless camera for elite photography.",
        zone: "mall",
        tag: "Bestseller"
    },
    {
        name: "Rolex Explorer II",
        price: 365000,
        category: "Watches",
        image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=800&q=80",
        description: "The ultimate tool watch for explorers and adventurers.",
        zone: "mall",
        tag: "Luxury"
    },

    // --- HEALTH HUB ---
    {
        name: "Elite Wellness Consultation",
        price: 2500,
        category: "Medical",
        image: "https://images.unsplash.com/photo-1505751172107-573957a2235c?auto=format&fit=crop&w=800&q=80",
        description: "Private 1-hour session with a leading wellness specialist.",
        zone: "health",
        tag: "Expert"
    },
    {
        name: "Premium Vitamin C + Zinc",
        price: 850,
        category: "Supplements",
        image: "https://images.unsplash.com/photo-1584017945391-5fe1f0b3d600?auto=format&fit=crop&w=800&q=80",
        description: "Liposomal Vitamin C for maximum absorption and immune support.",
        zone: "health",
        tag: "Essential"
    },
    {
        name: "Designer Frames + Lens",
        price: 12900,
        category: "Optical",
        image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=800&q=80",
        description: "Ultra-lightweight titanium frames with anti-blue light coating.",
        zone: "health",
        tag: "Style"
    },

    // --- SERVICES HUB ---
    {
        name: "Luxury AC Deep Clean",
        price: 1800,
        category: "HVAC",
        image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecb?auto=format&fit=crop&w=800&q=80",
        description: "Full microbial disinfection and deep cleaning for 1 AC unit.",
        zone: "services",
        tag: "Clean"
    },
    {
        name: "Smart Home Installation",
        price: 5500,
        category: "Electrical",
        image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80",
        description: "Complete setup of smart lighting and security hub components.",
        zone: "services",
        tag: "Modern"
    },
    {
        name: "High-Rise Glass Cleaning",
        price: 3200,
        category: "Maintenance",
        image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80",
        description: "Professional window cleaning for modern residential villas.",
        zone: "services",
        tag: "Value"
    }
];

async function main() {
    console.log('Cleaning up existing products...');
    await prisma.product.deleteMany({});

    console.log('Seeding new premium products...');
    for (const p of products) {
        await prisma.product.create({ data: p });
    }

    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });

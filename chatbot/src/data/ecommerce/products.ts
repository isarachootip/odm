export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    group?: string;
    subCategory?: string;
    image: string;
    description: string;
    zone: 'food' | 'mall' | 'health' | 'services';
    tag?: string;
    oldPrice?: number;
    quantity?: number;
}

export const MOCK_PRODUCTS: Product[] = [
    // --- MALL HUB (24 Items) ---
    {
        id: 'm1',
        name: 'iPhone 15 Pro Max',
        price: 48900,
        oldPrice: 52900,
        category: 'Gadgets',
        image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=800&q=80',
        description: 'Titanium design, A17 Pro chip, ultra-advanced 5G smartphone.',
        zone: 'mall',
        tag: 'Mall'
    },
    {
        id: 'm2',
        name: 'Sony WH-1000XM5',
        price: 14900,
        oldPrice: 16900,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        description: 'Industry-leading noise cancellation and premium sound quality.',
        zone: 'mall',
        tag: 'Best Seller'
    },
    {
        id: 'm3',
        name: 'MacBook Air M3',
        price: 39900,
        category: 'Computers',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
        description: 'Supercharged by M3, incredibly thin and fast.',
        zone: 'mall',
        tag: 'New'
    },
    {
        id: 'm4',
        name: 'Dyson Airwrap Multi-styler',
        price: 21900,
        category: 'Beauty Tech',
        image: 'https://images.unsplash.com/photo-1558317374-067df5f15430?auto=format&fit=crop&w=800&q=80',
        description: 'Dry. Curl. Shape. Smooth and hide flyaways with no extreme heat.',
        zone: 'mall',
        tag: 'Authentic'
    },
    {
        id: 'm5',
        name: 'Samsung 65" OLED TV',
        price: 59900,
        category: 'Appliances',
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
        description: 'Deep blacks, clean whites and lively colors.',
        zone: 'mall',
        tag: 'Free Shipping'
    },
    {
        id: 'm6',
        name: 'Luxury Leather Handbag',
        price: 85000,
        category: 'Fashion',
        image: 'https://images.unsplash.com/photo-1584917033904-493bb3c3cc0a?auto=format&fit=crop&w=800&q=80',
        description: 'Italian leather, handcrafted perfection.',
        zone: 'mall',
        tag: 'Premium'
    },
    {
        id: 'm7',
        name: 'Logitech G Pro Wireless',
        price: 4990,
        category: 'Gaming',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
        description: 'Lightweight gaming mouse used by top pro athletes.',
        zone: 'mall',
        tag: 'Pro'
    },
    {
        id: 'm8',
        name: 'Herman Miller Aeron',
        price: 45000,
        category: 'Furniture',
        image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=800&q=80',
        description: 'The definitive ergonomic office chair.',
        zone: 'mall',
        tag: 'Investment'
    },
    {
        id: 'm9',
        name: 'Nike Air Jordan 1 Retros',
        price: 12500,
        category: 'Footwear',
        image: 'https://images.unsplash.com/photo-1584444503794-b0ad82854e4e?auto=format&fit=crop&w=800&q=80',
        description: 'Timeless style, basketball legends.',
        zone: 'mall',
        tag: 'Vlike Select'
    },
    {
        id: 'm10',
        name: 'Nespresso Vertuo Pop',
        price: 7500,
        category: 'Kitchen',
        image: 'https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?auto=format&fit=crop&w=800&q=80',
        description: 'Cafe-quality coffee at the touch of a button.',
        zone: 'mall',
        tag: 'Popular'
    },
    {
        id: 'm11',
        name: 'GoPro HERO12 Black',
        price: 14500,
        category: 'Cameras',
        image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
        description: 'The most versatile camera in the world.',
        zone: 'mall'
    },
    {
        id: 'm12',
        name: 'Kindle Paperwhite',
        price: 5900,
        category: 'Reading',
        image: 'https://images.unsplash.com/photo-1594980598522-68a83d76472f?auto=format&fit=crop&w=800&q=80',
        description: 'Purpose-built for reading, now with a larger display.',
        zone: 'mall'
    },
    { id: 'm13', name: 'Smart Home Hub', price: 3200, category: 'Smart Home', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&w=800&q=80', description: 'Control your home with a single device.', zone: 'mall' },
    { id: 'm14', name: 'Designer Sunglasses', price: 12900, category: 'Fashion', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&w=800&q=80', description: 'UV400 protection with style.', zone: 'mall' },
    { id: 'm15', name: 'Portable SSD 2TB', price: 6500, category: 'Storage', image: 'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?auto=format&w=800&q=80', description: 'Fast transfers, durable design.', zone: 'mall' },
    { id: 'm16', name: 'Automatic Watch', price: 28000, category: 'Watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&w=800&q=80', description: 'Classic mechanical movement.', zone: 'mall' },
    { id: 'm17', name: 'Treadmill Pro', price: 35000, category: 'Sports', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&w=800&q=80', description: 'Fitness at home.', zone: 'mall' },
    { id: 'm18', name: 'Chef Knife Set', price: 8900, category: 'Kitchen', image: 'https://images.unsplash.com/photo-1593611664162-ef307a4315fb?auto=format&w=800&q=80', description: 'Professional grade cutlery.', zone: 'mall' },
    { id: 'm19', name: 'Electric Scooter', price: 18500, category: 'Mobility', image: 'https://images.unsplash.com/photo-1558231016-160e9091807d?auto=format&w=800&q=80', description: 'Clean commuting.', zone: 'mall' },
    { id: 'm20', name: 'Skin Care Set', price: 4500, category: 'Beauty', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&w=800&q=80', description: 'Daily glow routine.', zone: 'mall' },
    { id: 'm21', name: 'Board Game Collection', price: 2500, category: 'Hobbies', image: 'https://images.unsplash.com/photo-1632501641765-e901452ccc27?auto=format&w=800&q=80', description: 'Family fun nights.', zone: 'mall' },
    { id: 'm22', name: 'Pet Auto Feeder', price: 3800, category: 'Pets', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&w=800&q=80', description: 'Smart care for your pets.', zone: 'mall' },
    { id: 'm23', name: 'Wireless Projector', price: 12000, category: 'Electronics', image: 'https://images.unsplash.com/photo-1535016120720-40c646bebb7b?auto=format&w=800&q=80', description: 'Cinema anywhere.', zone: 'mall' },
    { id: 'm24', name: 'Canvas Art Print', price: 1500, category: 'Home Decor', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&w=800&q=80', description: 'Modern abstract art.', zone: 'mall' },

    // --- FOOD HUB (20 Items) ---
    {
        id: 'f1',
        name: 'Artisan Sourdough',
        price: 120,
        oldPrice: 150,
        category: 'Bakery',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
        description: 'Slow-fermented sourdough bread with a crispy crust.',
        zone: 'food',
        tag: 'Freshly Baked'
    },
    {
        id: 'f2',
        name: 'Organic Avocados',
        price: 85,
        category: 'Produce',
        image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=800&auto=format&fit=crop',
        description: 'Creamy Hass avocados, perfectly ripe.',
        zone: 'food',
        tag: 'Organic'
    },
    {
        id: 'f3',
        name: 'Premium Wagyu Beef',
        price: 1250,
        category: 'Meat',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop',
        description: 'A5 Grade Wagyu beef with excellent marbling.',
        zone: 'food',
        tag: 'Premium'
    },
    { id: 'f4', name: 'Truffle Pasta Kit', price: 650, category: 'Meal Kits', image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&w=800&q=80', description: 'Authentic Italian flavors.', zone: 'food' },
    { id: 'f5', name: 'Cold Brew Coffee', price: 120, category: 'Drinks', image: 'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?auto=format&w=800&q=80', description: '12-hour steeped artisan roast.', zone: 'food' },
    { id: 'f6', name: 'Japanese Sushi Set', price: 890, category: 'Gourmet', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&w=800&q=80', description: 'Fresh sashimi and nigiri.', zone: 'food' },
    { id: 'f7', name: 'Artisan Cheese Board', price: 1200, category: 'Deli', image: 'https://images.unsplash.com/photo-1544971587-b842c27f8e14?auto=format&w=800&q=80', description: 'Selection of fine cheeses and nuts.', zone: 'food' },
    { id: 'f8', name: 'Fresh Lobster Tail', price: 1500, category: 'Seafood', image: 'https://images.unsplash.com/photo-1504387828636-ad9293d7f63f?auto=format&w=800&q=80', description: 'Wild-caught Atlantic lobster.', zone: 'food' },
    { id: 'f9', name: 'Dark Chocolate Truffles', price: 450, category: 'Sweets', image: 'https://images.unsplash.com/photo-1548907602-02f6c6a76933?auto=format&w=800&q=80', description: '70% cocoa with sea salt.', zone: 'food' },
    { id: 'f10', name: 'Organic Honey', price: 320, category: 'Pantry', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&w=800&q=80', description: 'Raw, unpasteurized forest honey.', zone: 'food' },
    { id: 'f11', name: 'Matcha Tea Set', price: 950, category: 'Tea', image: 'https://images.unsplash.com/photo-1582793988951-9aed5509eb97?auto=format&w=800&q=80', description: 'Ceremonial grade matcha.', zone: 'food' },
    { id: 'f12', name: 'Heirloom Tomatoes', price: 120, category: 'Produce', image: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&w=800&q=80', description: 'Colorful and juicy heritage variety.', zone: 'food' },
    { id: 'f13', name: 'French Macarons', price: 580, category: 'Bakery', image: 'https://images.unsplash.com/photo-1569106297405-ec12dfcc8797?auto=format&w=800&q=80', description: 'Box of 12 assorted flavors.', zone: 'food' },
    { id: 'f14', name: 'Korean Kimchi 1kg', price: 280, category: 'Asian', image: 'https://images.unsplash.com/photo-1583224964978-2257b960c3d3?auto=format&w=800&q=80', description: 'Traditionally fermented.', zone: 'food' },
    { id: 'f15', name: 'Italian Olive Oil', price: 790, category: 'Pantry', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbadb8c5?auto=format&w=800&q=80', description: 'Extra virgin, cold-pressed.', zone: 'food' },
    { id: 'f16', name: 'Beef Wellington', price: 1800, category: 'Gourmet', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&w=800&q=80', description: 'Classic holiday centerpiece.', zone: 'food' },
    { id: 'f17', name: 'Sparkling Juice', price: 150, category: 'Drinks', image: 'https://images.unsplash.com/photo-1543255006-d6395b6f1171?auto=format&w=800&q=80', description: 'Non-alcoholic celebratory drink.', zone: 'food' },
    { id: 'f18', name: 'Ravioli ai Funghi', price: 350, category: 'Pasta', image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&w=800&q=80', description: 'Mushroom filled handmade pasta.', zone: 'food' },
    { id: 'f19', name: 'Exotic Fruit Basket', price: 1200, category: 'Produce', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&w=800&q=80', description: 'Mangoes, dragon fruit, and more.', zone: 'food' },
    { id: 'f20', name: 'Baklava Box', price: 450, category: 'Sweets', image: 'https://images.unsplash.com/photo-1519676867240-f031ea443067?auto=format&w=800&q=80', description: 'Sweet Mediterranean pastry.', zone: 'food' },

    // --- HEALTH HUB (12 Items) ---
    {
        id: 'h1',
        name: 'Elite Wellness Plan',
        price: 2500,
        category: 'Medical',
        image: 'https://images.unsplash.com/photo-1505751172107-573957a2235c?auto=format&fit=crop&w=800&q=80',
        description: 'Private 1-hour session with a leading wellness specialist.',
        zone: 'health',
        tag: 'Expert'
    },
    { id: 'h2', name: 'Premium Multivitamins', price: 950, category: 'Supplements', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&w=800&q=80', description: 'Full spectrum health support.', zone: 'health' },
    { id: 'h3', name: 'Organic Protein Powder', price: 1800, category: 'Fitness', image: 'https://images.unsplash.com/photo-1593094859029-1015d214a14d?auto=format&w=800&q=80', description: 'Plant-based muscle recovery.', zone: 'health' },
    { id: 'h4', name: 'Yoga Retreat Package', price: 15000, category: 'Wellness', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&w=800&q=80', description: '3 nights of mental and physical healing.', zone: 'health' },
    { id: 'h5', name: 'Air Purifier HEPA H13', price: 8900, category: 'Equipment', image: 'https://images.unsplash.com/photo-1585771724684-2626ef7f446e?auto=format&w=800&q=80', description: 'Medical grade air filtration.', zone: 'health' },
    { id: 'h6', name: 'Smart Blood Pressure Monitor', price: 3200, category: 'Tech', image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a4e?auto=format&w=800&q=80', description: 'Track your health in real-time.', zone: 'health' },
    { id: 'h7', name: 'Massage Therapy Gun', price: 4500, category: 'Recovery', image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&w=800&q=80', description: 'Professional deep tissue massage.', zone: 'health' },
    { id: 'h8', name: 'Herbal Detox Tea', price: 450, category: 'Supplements', image: 'https://images.unsplash.com/photo-1544787210-2211d7c309c7?auto=format&w=800&q=80', description: 'Cleanse your system naturally.', zone: 'health' },
    { id: 'h9', name: 'Home First Aid Professional Kit', price: 1500, category: 'Medical', image: 'https://images.unsplash.com/photo-1603398938378-e54eab446df1?auto=format&w=800&q=80', description: 'Everything for emergencies.', zone: 'health' },
    { id: 'h10', name: 'Weighted Sleep Blanket', price: 2800, category: 'Sleep', image: 'https://images.unsplash.com/photo-1520101684784-24e650d268a7?auto=format&w=800&q=80', description: 'Deeper, more restful sleep.', zone: 'health' },
    { id: 'h11', name: 'Orthopedic Pillow', price: 1200, category: 'Sleep', image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&w=800&q=80', description: 'Ergonomic neck support.', zone: 'health' },
    { id: 'h12', name: 'Organic Face Oil', price: 850, category: 'Skincare', image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&w=800&q=80', description: 'Pure rosehip and vitamin E.', zone: 'health' },

    // --- SERVICES HUB (12 Items) ---
    {
        id: 's1',
        name: 'Luxury AC Deep Clean',
        price: 1800,
        category: 'Home',
        image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecb?auto=format&fit=crop&w=800&q=80',
        description: 'Full microbial disinfection and deep cleaning.',
        zone: 'services',
        tag: 'Maintenance'
    },
    { id: 's2', name: 'Professional Photography', price: 5000, category: 'Media', image: 'https://images.unsplash.com/photo-1493723843671-1d655e7d98f0?auto=format&w=800&q=80', description: '2 Hours of portrait or event coverage.', zone: 'services' },
    { id: 's3', name: 'Deep Home Cleaning', price: 2500, category: 'Home', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6954?auto=format&w=800&q=80', description: 'Eco-friendly chemical clean.', zone: 'services' },
    { id: 's4', name: 'Tech Support - Remote', price: 800, category: 'IT', image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&w=800&q=80', description: 'Resolve software issues instantly.', zone: 'services' },
    { id: 's5', name: 'Interior Design Consultation', price: 3500, category: 'Design', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&w=800&q=80', description: '1-on-1 with a senior designer.', zone: 'services' },
    { id: 's6', name: 'Private Tutoring', price: 1200, category: 'Education', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&w=800&q=80', description: 'English or Mathematics experts.', zone: 'services' },
    { id: 's7', name: 'Car Detailing Package', price: 4500, category: 'Auto', image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&w=800&q=80', description: 'Full interior and exterior restoration.', zone: 'services' },
    { id: 's8', name: 'Electrician Call-Out', price: 600, category: 'Home', image: 'https://images.unsplash.com/photo-1621905252507-b354bcadcabc?auto=format&w=800&q=80', description: 'Safety check and minor repairs.', zone: 'services' },
    { id: 's9', name: 'Personal Trainer Session', price: 1500, category: 'Fitness', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&w=800&q=80', description: 'High-intensity tailored workout.', zone: 'services' },
    { id: 's10', name: 'Moving Services (Local)', price: 8000, category: 'Logistics', image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&w=800&q=80', description: 'Full packing and transport service.', zone: 'services' },
    { id: 's11', name: 'Laundry & Ironing Service', price: 450, category: 'Home', image: 'https://images.unsplash.com/photo-1545173158-48d366743e71?auto=format&w=800&q=80', description: '5kg load with premium care.', zone: 'services' },
    { id: 's12', name: 'Pet Grooming - Mobile', price: 1200, category: 'Pets', image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&w=800&q=80', description: 'We come to your door.', zone: 'services' }
];

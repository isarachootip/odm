require('dotenv').config({ path: '.env.local' });
const { validateMessage } = require('@line/bot-sdk');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { createCategoryBubble, createOrderFoodBubble, createCarousel } = require('./src/lib/flex-templates.ts');
// since flex-templates is TS, it might not run directly from node without ts-node

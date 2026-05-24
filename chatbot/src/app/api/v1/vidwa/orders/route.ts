import { NextRequest } from 'next/server';
import { fetchOrders } from '@/lib/api-helper';

export async function GET(request: NextRequest) {
    return fetchOrders(request, 'API_KEY_VIDWA');
}

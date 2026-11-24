import { listOrders } from '@/lib/cart-server';
import { respond } from '@/lib/cart-route';

export const GET = () => respond(async () => ({ orders: await listOrders() }));

import { placeOrder } from '@/lib/cart-server';
import { respond } from '@/lib/cart-route';

export const POST = () => respond(placeOrder);

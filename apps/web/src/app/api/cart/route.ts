import { clearCart, getCart } from '@/lib/cart-server';
import { respond } from '@/lib/cart-route';

export const GET = () => respond(getCart);
/** Clear the cart: the next visit starts with an empty one. */
export const DELETE = () => respond(clearCart);

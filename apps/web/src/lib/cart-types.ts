/** Shapes shared by the cart and order routes (server) and the store and pages (browser). Money is in rupees. */

export type CartLine = {
  /** Medusa line item id */
  id: string;
  variantId: string;
  slug: string;
  name: string;
  price: number;
  mrp?: number | null;
  image?: string | null;
  unit?: string | null;
  qty: number;
};

export type Customer = { name: string; email: string; phone: string; address: string; city: string; state: string; pincode: string };

export type CartData = {
  items: CartLine[];
  subtotal: number;
  discount: number;
  /** Delivery charge from Medusa once the address step has chosen a delivery method; 0 before that. */
  shipping: number;
  shippingChosen: boolean;
  total: number;
  coupon: string | null;
  email: string | null;
  address: Customer | null;
};

export type OrderData = {
  id: string;
  /** The number people see, for example 12 */
  number: number;
  placedAt: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  items: Pick<CartLine, 'id' | 'slug' | 'name' | 'price' | 'image' | 'qty'>[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon: string | null;
  payment: string;
  customer: Customer;
};

export const emptyCart: CartData = { items: [], subtotal: 0, discount: 0, shipping: 0, shippingChosen: false, total: 0, coupon: null, email: null, address: null };

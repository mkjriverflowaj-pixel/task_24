import { setAddress } from '@/lib/cart-server';
import { readJson, respond } from '@/lib/cart-route';

export async function POST(request: Request) {
  const body = await readJson(request);
  const text = (key: string, max = 120) => (typeof body[key] === 'string' ? (body[key] as string).trim().slice(0, max) : '');
  const customer = { name: text('name'), email: text('email'), phone: text('phone', 15), address: text('address', 200), city: text('city'), state: text('state'), pincode: text('pincode', 6) };
  if (customer.name.length < 2 || !/^\S+@\S+\.\S+$/.test(customer.email) || !/^[6-9]\d{9}$/.test(customer.phone) || customer.address.length < 6 || customer.city.length < 2 || customer.state.length < 2 || !/^\d{6}$/.test(customer.pincode)) {
    return Response.json({ message: 'Please check your delivery details.' }, { status: 400 });
  }
  return respond(() => setAddress(customer));
}

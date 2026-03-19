-- ============================================================
--  AESTHETIC ATHLETES — SUPABASE SQL SETUP
--  Paste this ENTIRE file into Supabase → SQL Editor → Run
-- ============================================================

-- 1. PROFILES
create table if not exists public.profiles (
  id         uuid references auth.users on delete cascade primary key,
  email      text,
  full_name  text,
  phone      text,
  sport      text,
  role       text default 'customer' check (role in ('customer','admin')),
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
drop policy if exists "Users read own profile"   on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "Admin all profiles"       on public.profiles;
create policy "Users read own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admin all profiles"       on public.profiles for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, phone, sport)
  values (new.id, new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'sport')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute procedure public.handle_new_user();

-- 2. PRODUCTS
create table if not exists public.products (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  description text,
  price       decimal(10,2) not null,
  image_url   text,
  category    text,
  stock       int default 0,
  active      boolean default true,
  created_at  timestamptz default now()
);
alter table public.products enable row level security;
drop policy if exists "Public view active products" on public.products;
drop policy if exists "Admin manage products"       on public.products;
create policy "Public view active products" on public.products for select using (active = true);
create policy "Admin manage products"       on public.products for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 3. ORDERS
create table if not exists public.orders (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references public.profiles(id),
  status           text default 'pending' check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  total            decimal(10,2),
  delivery_address text,
  city             text,
  notes            text,
  created_at       timestamptz default now()
);
alter table public.orders enable row level security;
drop policy if exists "Users see own orders"    on public.orders;
drop policy if exists "Users create orders"     on public.orders;
drop policy if exists "Admin manage all orders" on public.orders;
create policy "Users see own orders"    on public.orders for select using (auth.uid() = user_id);
create policy "Users create orders"     on public.orders for insert with check (auth.uid() = user_id);
create policy "Admin manage all orders" on public.orders for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 4. ORDER ITEMS
create table if not exists public.order_items (
  id         uuid default gen_random_uuid() primary key,
  order_id   uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  quantity   int not null,
  unit_price decimal(10,2) not null
);
alter table public.order_items enable row level security;
drop policy if exists "Users see own order items"  on public.order_items;
drop policy if exists "Users create order items"   on public.order_items;
drop policy if exists "Admin manage all order items" on public.order_items;
create policy "Users see own order items" on public.order_items for select using (
  exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
);
create policy "Users create order items" on public.order_items for insert with check (
  exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
);
create policy "Admin manage all order items" on public.order_items for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 5. STORAGE
insert into storage.buckets (id, name, public) values ('product-images','product-images',true) on conflict do nothing;
drop policy if exists "Public read images"  on storage.objects;
drop policy if exists "Admin upload images" on storage.objects;
create policy "Public read images"  on storage.objects for select using (bucket_id = 'product-images');
create policy "Admin upload images" on storage.objects for insert with check (
  bucket_id = 'product-images' and
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 6. SAMPLE PRODUCTS
insert into public.products (name, description, price, category, stock, image_url) values
('Pro Running Shoes',    'Lightweight responsive foam sole for elite runners.',        129.99, 'Footwear',   50,  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'),
('Performance Tee',      'Moisture-wicking anti-odour athletic shirt.',                34.99,  'Apparel',    100, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'),
('Track Shorts',         'Aero-fit shorts with built-in liner for max comfort.',       49.99,  'Apparel',    80,  'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80'),
('Resistance Bands Set', '5-band progressive set — 10 to 50 lb resistance.',          24.99,  'Equipment',  120, 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80'),
('Hydration Backpack',   '2L bladder pack, perfect for trail runs and long rides.',    69.99,  'Accessories',40,  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80'),
('Training Gloves',      'Grip-enhanced padded gloves with wrist support.',            29.99,  'Accessories',60,  'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=600&q=80'),
('Compression Socks',    'Graduated compression for faster recovery.',                 19.99,  'Apparel',    150, 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&q=80'),
('Speed Jump Rope',      'Ball-bearing speed rope, adjustable cable for HIIT.',        22.99,  'Equipment',  90,  'https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=600&q=80')
on conflict do nothing;

-- 7. TO MAKE YOURSELF ADMIN (run after signing up):
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';

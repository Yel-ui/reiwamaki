
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Menu items
CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  category text NOT NULL,
  image text NOT NULL DEFAULT '🍣',
  available boolean NOT NULL DEFAULT true,
  customizations jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available items" ON public.menu_items
  FOR SELECT USING (available OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage menu items" ON public.menu_items
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Seed menu (with shared customization presets inlined)
INSERT INTO public.menu_items (slug, name, description, price, category, image, customizations) VALUES
('sb1','Sushi Bake California','Creamy baked California-style sushi with crab, mayo, and nori — perfect for sharing',320,'Sushi Bake','🍱',
  '[{"id":"spice","label":"Spice Level","choices":[{"value":"mild","label":"Mild"},{"value":"medium","label":"Medium"},{"value":"hot","label":"Hot 🔥"},{"value":"extra-hot","label":"Extra Hot 🔥🔥","extra":10}]},{"id":"sauce","label":"Extra Sauce","choices":[{"value":"none","label":"None"},{"value":"soy","label":"Extra Soy Sauce"},{"value":"spicy-mayo","label":"Spicy Mayo","extra":15},{"value":"unagi","label":"Unagi Sauce","extra":15},{"value":"ponzu","label":"Ponzu"}]}]'::jsonb),
('sb2','Sushi Bake Spicy Tuna','Oven-baked spicy tuna layered over seasoned sushi rice with a kick of heat',290,'Sushi Bake','🍱',
  '[{"id":"spice","label":"Spice Level","choices":[{"value":"mild","label":"Mild"},{"value":"medium","label":"Medium"},{"value":"hot","label":"Hot 🔥"},{"value":"extra-hot","label":"Extra Hot 🔥🔥","extra":10}]},{"id":"sauce","label":"Extra Sauce","choices":[{"value":"none","label":"None"},{"value":"soy","label":"Extra Soy Sauce"},{"value":"spicy-mayo","label":"Spicy Mayo","extra":15},{"value":"unagi","label":"Unagi Sauce","extra":15},{"value":"ponzu","label":"Ponzu"}]}]'::jsonb),
('sb3','Sushi Bake 3n1','Three-flavor sushi bake platter — California, Spicy Tuna & Cheesy Nigiri in one box',870,'Sushi Bake','⭐',
  '[{"id":"spice","label":"Spice Level","choices":[{"value":"mild","label":"Mild"},{"value":"medium","label":"Medium"},{"value":"hot","label":"Hot 🔥"},{"value":"extra-hot","label":"Extra Hot 🔥🔥","extra":10}]},{"id":"sauce","label":"Extra Sauce","choices":[{"value":"none","label":"None"},{"value":"soy","label":"Extra Soy Sauce"},{"value":"spicy-mayo","label":"Spicy Mayo","extra":15},{"value":"unagi","label":"Unagi Sauce","extra":15},{"value":"ponzu","label":"Ponzu"}]}]'::jsonb),
('mk1','California Maki','Classic maki roll with crab stick, avocado, and cucumber — 8 pieces per order',240,'Maki','🍣',
  '[{"id":"sauce","label":"Extra Sauce","choices":[{"value":"none","label":"None"},{"value":"soy","label":"Extra Soy Sauce"},{"value":"spicy-mayo","label":"Spicy Mayo","extra":15},{"value":"unagi","label":"Unagi Sauce","extra":15},{"value":"ponzu","label":"Ponzu"}]}]'::jsonb),
('mk2','Cheesy California Maki','California maki topped with melted cheese for an extra creamy twist — 8 pieces',190,'Maki','🧀',
  '[{"id":"sauce","label":"Extra Sauce","choices":[{"value":"none","label":"None"},{"value":"soy","label":"Extra Soy Sauce"},{"value":"spicy-mayo","label":"Spicy Mayo","extra":15},{"value":"unagi","label":"Unagi Sauce","extra":15},{"value":"ponzu","label":"Ponzu"}]}]'::jsonb),
('sp1','Sushi Cheesy Nigiri','Hand-pressed nigiri topped with torched cheese and a drizzle of special sauce',190,'Specialty','🍣',
  '[{"id":"sauce","label":"Extra Sauce","choices":[{"value":"none","label":"None"},{"value":"soy","label":"Extra Soy Sauce"},{"value":"spicy-mayo","label":"Spicy Mayo","extra":15},{"value":"unagi","label":"Unagi Sauce","extra":15},{"value":"ponzu","label":"Ponzu"}]}]'::jsonb),
('sp2','Anori','Crispy nori-wrapped sushi bites with seasoned rice and savory filling',190,'Specialty','🌿',
  '[{"id":"sauce","label":"Extra Sauce","choices":[{"value":"none","label":"None"},{"value":"soy","label":"Extra Soy Sauce"},{"value":"spicy-mayo","label":"Spicy Mayo","extra":15},{"value":"unagi","label":"Unagi Sauce","extra":15},{"value":"ponzu","label":"Ponzu"}]}]'::jsonb),
('sp3','Anori','Crispy nori-wrapped sushi bites with seasoned rice and savory filling',190,'Specialty','🌿',
  '[{"id":"spice","label":"Spice Level","choices":[{"value":"mild","label":"Mild"},{"value":"medium","label":"Medium"},{"value":"hot","label":"Hot 🔥"},{"value":"extra-hot","label":"Extra Hot 🔥🔥","extra":10}]}]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Admin policies for orders
CREATE POLICY "Admins view all orders" ON public.orders
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update orders" ON public.orders
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all order items" ON public.order_items
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all profiles (for customer list)
CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

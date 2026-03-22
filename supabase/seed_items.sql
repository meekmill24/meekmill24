DO $$ 
DECLARE 
    l_id INT;
BEGIN
    FOR l_id IN 1..5 LOOP
        INSERT INTO public.task_items (title, image_url, category, description, level_id)
        VALUES 
        ('Apple iPhone 15 Pro Max - 1TB Titanium', 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&q=80', 'Electronics', 'Flagship smartphone with titanium design and A17 Pro chip.', l_id),
        ('Sony Alpha a7R V Mirrorless Camera', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', 'Photography', '61MP full-frame mirrorless camera with AI-based autofocus.', l_id),
        ('Rolex Submariner Date "Starbucks"', 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80', 'Luxury', 'Iconic divers watch with green Cerachrom bezel.', l_id),
        ('MacBook Pro 16" M3 Max - 128GB RAM', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80', 'Computing', 'The most powerful MacBook ever for professional workflows.', l_id),
        ('Dyson V15 Detect Absolute Vacuum', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&q=80', 'Home', 'Powerful cord-free vacuum with laser illumination.', l_id),
        ('Hermès Birkin 30 Gold Hardware', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', 'Luxury', 'Timeless fashion icon in Togo leather.', l_id),
        ('Tesla Powerwall 3 - Home Battery', 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80', 'Energy', 'Integrated solar battery system for sustainable living.', l_id),
        ('Bang & Olufsen Beolab 90 Speakers', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80', 'Audio', 'Pure performance for the ultimate listening experience.', l_id),
        ('Peloton Bike+ Ultimate Package', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', 'Fitness', 'Immersive cardio experience with rotating screen.', l_id),
        ('Leica M11 Rangefinder Camera', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80', 'Photography', 'Legendary rangefinder camera with triple resolution.', l_id);
    END LOOP;
END $$;

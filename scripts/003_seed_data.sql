-- Simple Music - Seed Data

-- Seed levels
INSERT INTO levels (id, name, required_deposit, tasks_per_set, sets_count, commission_rate, description, color)
VALUES 
  (1, 'Level 1 Collector', 100.00, 40, 3, 0.0250, 'Earn consistent commissions by completing 40 tasks per set across 3 sets.', '#A7F3D0'),
  (2, 'Level 2 Collector', 200.00, 45, 3, 0.0300, 'Earn consistent commissions by completing 45 tasks per set across 3 sets.', '#E9D5FF'),
  (3, 'Level 3 Collector', 500.00, 50, 3, 0.0350, 'Earn consistent commissions by completing 50 tasks per set across 3 sets.', '#FDE68A'),
  (4, 'Level 4 Collector', 1000.00, 55, 4, 0.0400, 'Earn consistent commissions by completing 55 tasks per set across 4 sets.', '#FECACA'),
  (5, 'Level 5 Collector', 2000.00, 60, 4, 0.0450, 'Earn consistent commissions by completing 60 tasks per set across 4 sets.', '#BFDBFE')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  required_deposit = EXCLUDED.required_deposit,
  tasks_per_set = EXCLUDED.tasks_per_set,
  sets_count = EXCLUDED.sets_count,
  commission_rate = EXCLUDED.commission_rate,
  description = EXCLUDED.description,
  color = EXCLUDED.color;

-- Reset sequence
SELECT setval('levels_id_seq', (SELECT MAX(id) FROM levels));

-- Seed site settings
INSERT INTO site_settings (id, maintenance_mode, allow_registrations, allow_deposits, allow_withdrawals, min_withdrawal, referral_bonus)
VALUES (1, FALSE, TRUE, TRUE, TRUE, 10.00, 5.00)
ON CONFLICT (id) DO UPDATE SET
  maintenance_mode = EXCLUDED.maintenance_mode,
  allow_registrations = EXCLUDED.allow_registrations,
  allow_deposits = EXCLUDED.allow_deposits,
  allow_withdrawals = EXCLUDED.allow_withdrawals,
  min_withdrawal = EXCLUDED.min_withdrawal,
  referral_bonus = EXCLUDED.referral_bonus;

-- Seed some sample tasks (music-related images)
INSERT INTO tasks (title, image_url, reward, is_active)
VALUES 
  ('DJ Performance', 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=200&h=200&fit=crop', 1.00, TRUE),
  ('Ocean Waves', 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=200&h=200&fit=crop', 1.00, TRUE),
  ('Vintage Microphone', 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=200&h=200&fit=crop', 1.50, TRUE),
  ('Coding Setup', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200&h=200&fit=crop', 1.00, TRUE),
  ('Music Quote', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop', 2.00, TRUE),
  ('Live Concert', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&h=200&fit=crop', 1.50, TRUE),
  ('Balloons Celebration', 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=200&h=200&fit=crop', 1.00, TRUE),
  ('Microphone Close-up', 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200&h=200&fit=crop', 1.00, TRUE),
  ('Friends Gathering', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=200&fit=crop', 1.50, TRUE),
  ('Acoustic Guitar', 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=200&h=200&fit=crop', 2.00, TRUE),
  ('Mountain Landscape', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&h=200&fit=crop', 1.00, TRUE),
  ('Sunset Beach', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=200&fit=crop', 1.00, TRUE),
  ('Forest Path', 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&h=200&fit=crop', 1.50, TRUE),
  ('City Lights', 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=200&h=200&fit=crop', 1.00, TRUE),
  ('Vinyl Records', 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=200&h=200&fit=crop', 2.00, TRUE),
  ('Piano Keys', 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=200&h=200&fit=crop', 1.50, TRUE)
ON CONFLICT DO NOTHING;

-- Seed a global notification
INSERT INTO notifications (title, message, type, is_global)
VALUES ('1-5000 USDT reward available now', 'Complete tasks to earn rewards. New users get bonus rewards!', 'reward', TRUE)
ON CONFLICT DO NOTHING;

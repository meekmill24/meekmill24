-- Institutional Price Calibration Node
-- Run this in your Supabase SQL Editor

UPDATE public.levels SET price = 1000 WHERE id = 3;
UPDATE public.levels SET price = 5000 WHERE id = 5;

-- Verify results
SELECT id, name, price FROM public.levels ORDER BY id ASC;

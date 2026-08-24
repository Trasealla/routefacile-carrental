-- Add sort_order column to car_categories table
ALTER TABLE car_categories ADD COLUMN sort_order INT NOT NULL DEFAULT 0;

-- Set initial sort order based on desired category sequence
UPDATE car_categories SET sort_order = 1 WHERE id = 2;  -- Economy
UPDATE car_categories SET sort_order = 2 WHERE id = 1;  -- Compact
UPDATE car_categories SET sort_order = 3 WHERE id = 3;  -- Mid-Size
UPDATE car_categories SET sort_order = 4 WHERE id = 6;  -- Family
UPDATE car_categories SET sort_order = 5 WHERE id = 7;  -- Premium
UPDATE car_categories SET sort_order = 6 WHERE id = 13; -- Electric
UPDATE car_categories SET sort_order = 7 WHERE id = 15; -- SUVs

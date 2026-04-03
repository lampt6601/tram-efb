-- Drop review feature: remove public_reviews view and reviews table

DROP VIEW IF EXISTS public_reviews CASCADE;

DROP TABLE IF EXISTS reviews CASCADE;

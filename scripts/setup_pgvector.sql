-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Add embedding column to students table (if it doesn't exist)
-- Assuming Facenet model (128 dimensions)
alter table students add column if not exists embedding vector(128);

-- Create an index for faster similarity search (IVFFlat or HNSW)
-- HNSW is generally faster for recall but takes longer to build
create index on students using hnsw (embedding vector_l2_ops);

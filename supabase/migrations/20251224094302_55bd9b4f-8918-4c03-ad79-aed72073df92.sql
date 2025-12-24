-- Add pinned column to conversations
ALTER TABLE public.conversations 
ADD COLUMN pinned BOOLEAN NOT NULL DEFAULT false;
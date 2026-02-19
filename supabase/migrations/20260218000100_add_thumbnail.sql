-- Add thumbnail_image_id to tf_trees for user-selected hero image
ALTER TABLE tf_trees
  ADD COLUMN thumbnail_image_id UUID REFERENCES tf_tree_images(id) ON DELETE SET NULL;

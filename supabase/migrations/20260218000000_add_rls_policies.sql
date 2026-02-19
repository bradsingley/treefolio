-- Migration: Add RLS policies for storage and tf_ tables
-- Created: 2026-02-18
-- Description: Allows public (anon) access to the treefolio storage bucket
--              and all tf_-prefixed tables. This is a single-user app with no auth.

-- ============================================================
-- Storage policies for the "treefolio" bucket
-- ============================================================

CREATE POLICY "treefolio_public_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'treefolio');

CREATE POLICY "treefolio_public_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'treefolio');

CREATE POLICY "treefolio_public_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'treefolio')
  WITH CHECK (bucket_id = 'treefolio');

CREATE POLICY "treefolio_public_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'treefolio');

-- ============================================================
-- Table RLS policies (enable RLS + allow all for anon)
-- ============================================================

ALTER TABLE tf_species ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tf_species_public_access" ON tf_species
  FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE tf_trees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tf_trees_public_access" ON tf_trees
  FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE tf_tree_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tf_tree_images_public_access" ON tf_tree_images
  FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE tf_journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tf_journal_entries_public_access" ON tf_journal_entries
  FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE tf_care_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tf_care_recommendations_public_access" ON tf_care_recommendations
  FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE tf_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tf_chat_messages_public_access" ON tf_chat_messages
  FOR ALL USING (true) WITH CHECK (true);

-- BUG FIX: Allow file_metadata_id to be temporarily NULL so we can
-- saveAndFlush() the WorkerDocument record in MySQL BEFORE uploading
-- to MinIO. This prevents orphaned MinIO objects when the DB insert fails.
ALTER TABLE worker_documents
    MODIFY COLUMN file_metadata_id BIGINT NULL;

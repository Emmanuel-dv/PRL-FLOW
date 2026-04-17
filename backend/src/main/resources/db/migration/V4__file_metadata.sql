CREATE TABLE file_metadata (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  bucket_name VARCHAR(255) NOT NULL,
  object_key VARCHAR(500) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_by BIGINT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_filemeta_user
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE INDEX idx_filemeta_uploaded_by ON file_metadata(uploaded_by);

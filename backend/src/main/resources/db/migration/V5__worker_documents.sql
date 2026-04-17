CREATE TABLE worker_documents (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  document_type_id BIGINT NOT NULL,
  file_metadata_id BIGINT NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  status ENUM('PENDING_REVIEW','APPROVED','REJECTED','EXPIRED')
    NOT NULL DEFAULT 'PENDING_REVIEW',
  rejection_reason TEXT,
  reviewed_by BIGINT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  CONSTRAINT fk_wdoc_user
    FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_wdoc_doctype
    FOREIGN KEY (document_type_id) REFERENCES document_types(id),
  CONSTRAINT fk_wdoc_filemeta
    FOREIGN KEY (file_metadata_id) REFERENCES file_metadata(id),
  CONSTRAINT fk_wdoc_reviewer
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

CREATE INDEX idx_wdoc_user ON worker_documents(user_id);
CREATE INDEX idx_wdoc_status ON worker_documents(status);
CREATE INDEX idx_wdoc_expiry ON worker_documents(expiry_date);

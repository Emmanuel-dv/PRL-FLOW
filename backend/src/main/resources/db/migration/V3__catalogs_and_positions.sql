CREATE TABLE job_positions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_jobpos_company FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE document_types (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  validity_days INT,
  requires_expiry BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_doctype_company FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE epi_catalog (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  reference_code VARCHAR(100),
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_epicatalog_company FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE position_document_req (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  job_position_id BIGINT NOT NULL,
  document_type_id BIGINT NOT NULL,
  mandatory BOOLEAN NOT NULL DEFAULT TRUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_posreq_position FOREIGN KEY (job_position_id) REFERENCES job_positions(id),
  CONSTRAINT fk_posreq_doctype FOREIGN KEY (document_type_id) REFERENCES document_types(id),
  CONSTRAINT uq_pos_doctype UNIQUE (job_position_id, document_type_id)
);

CREATE TABLE position_epi_req (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  job_position_id BIGINT NOT NULL,
  epi_catalog_id BIGINT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_epireq_position FOREIGN KEY (job_position_id) REFERENCES job_positions(id),
  CONSTRAINT fk_epireq_catalog FOREIGN KEY (epi_catalog_id) REFERENCES epi_catalog(id),
  CONSTRAINT uq_pos_epi UNIQUE (job_position_id, epi_catalog_id)
);

CREATE INDEX idx_jobpos_company ON job_positions(company_id);
CREATE INDEX idx_doctype_company ON document_types(company_id);
CREATE INDEX idx_epicatalog_company ON epi_catalog(company_id);

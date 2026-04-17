CREATE TABLE epi_deliveries (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT NOT NULL,
  manager_id BIGINT NOT NULL,
  worker_id BIGINT NOT NULL,
  status ENUM('PENDING','DELIVERED','CONFIRMED')
    NOT NULL DEFAULT 'PENDING',
  opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP,
  notes TEXT,
  CONSTRAINT fk_delivery_company
    FOREIGN KEY (company_id) REFERENCES companies(id),
  CONSTRAINT fk_delivery_manager
    FOREIGN KEY (manager_id) REFERENCES users(id),
  CONSTRAINT fk_delivery_worker
    FOREIGN KEY (worker_id) REFERENCES users(id)
);

CREATE TABLE epi_delivery_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  epi_delivery_id BIGINT NOT NULL,
  epi_catalog_id BIGINT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  CONSTRAINT fk_item_delivery
    FOREIGN KEY (epi_delivery_id) REFERENCES epi_deliveries(id),
  CONSTRAINT fk_item_catalog
    FOREIGN KEY (epi_catalog_id) REFERENCES epi_catalog(id)
);

CREATE TABLE epi_delivery_confirms (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  epi_delivery_id BIGINT NOT NULL UNIQUE,
  worker_id BIGINT NOT NULL,
  confirmed_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  confirmation_hash VARCHAR(64) NOT NULL,
  CONSTRAINT fk_confirm_delivery
    FOREIGN KEY (epi_delivery_id) REFERENCES epi_deliveries(id),
  CONSTRAINT fk_confirm_worker
    FOREIGN KEY (worker_id) REFERENCES users(id)
);

CREATE INDEX idx_delivery_worker ON epi_deliveries(worker_id);
CREATE INDEX idx_delivery_manager ON epi_deliveries(manager_id);
CREATE INDEX idx_delivery_company ON epi_deliveries(company_id);
CREATE INDEX idx_delivery_status ON epi_deliveries(status);

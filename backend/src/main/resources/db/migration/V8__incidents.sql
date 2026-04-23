CREATE TABLE incidents (
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_id   BIGINT       NOT NULL,
    reported_by  BIGINT       NOT NULL,
    assigned_to  BIGINT,
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    type         ENUM('SAFETY_RISK','ACCIDENT','NEAR_MISS','EQUIPMENT_FAULT','OTHER') NOT NULL,
    severity     ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL,
    status       ENUM('OPEN','IN_PROGRESS','RESOLVED','CLOSED') NOT NULL DEFAULT 'OPEN',
    location     VARCHAR(255) NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at  TIMESTAMP,
    CONSTRAINT fk_incident_company
        FOREIGN KEY (company_id)  REFERENCES companies(id),
    CONSTRAINT fk_incident_reporter
        FOREIGN KEY (reported_by) REFERENCES users(id),
    CONSTRAINT fk_incident_assignee
        FOREIGN KEY (assigned_to) REFERENCES users(id)
);

CREATE TABLE incident_status_logs (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    incident_id BIGINT NOT NULL,
    changed_by  BIGINT NOT NULL,
    old_status  ENUM('OPEN','IN_PROGRESS','RESOLVED','CLOSED'),
    new_status  ENUM('OPEN','IN_PROGRESS','RESOLVED','CLOSED') NOT NULL,
    comment     TEXT,
    changed_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_statuslog_incident
        FOREIGN KEY (incident_id) REFERENCES incidents(id),
    CONSTRAINT fk_statuslog_user
        FOREIGN KEY (changed_by)  REFERENCES users(id)
);

CREATE INDEX idx_incident_company  ON incidents(company_id);
CREATE INDEX idx_incident_status   ON incidents(status);
CREATE INDEX idx_incident_severity ON incidents(severity);
CREATE INDEX idx_incident_reporter ON incidents(reported_by);
CREATE INDEX idx_statuslog_incident ON incident_status_logs(incident_id);

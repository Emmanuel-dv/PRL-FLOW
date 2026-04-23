CREATE TABLE notifications (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id             BIGINT       NOT NULL,
    type                ENUM(
                            'DOCUMENT_EXPIRING_SOON',
                            'DOCUMENT_EXPIRED',
                            'DOCUMENT_REJECTED',
                            'DOCUMENT_APPROVED',
                            'EPI_DELIVERY_PENDING',
                            'EPI_DELIVERY_CONFIRMED',
                            'INCIDENT_CREATED',
                            'INCIDENT_ASSIGNED',
                            'INCIDENT_STATUS_CHANGED'
                        ) NOT NULL,
    title               VARCHAR(255) NOT NULL,
    message             TEXT         NOT NULL,
    is_read             BOOLEAN      NOT NULL DEFAULT FALSE,
    related_entity_type VARCHAR(50),
    related_entity_id   BIGINT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_notif_user   ON notifications(user_id);
CREATE INDEX idx_notif_unread ON notifications(user_id, is_read);

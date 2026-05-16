-- Las columnas manager_id y job_position_id ya existen desde V1
-- Solo añadimos la FK de job_position que faltaba porque en V1
-- la tabla job_positions aún no existía.

ALTER TABLE users
    ADD CONSTRAINT fk_user_jobposition
        FOREIGN KEY (job_position_id) REFERENCES job_positions(id);

-- Índices de rendimiento para las nuevas navegaciones JPA
CREATE INDEX idx_users_manager ON users(manager_id);
CREATE INDEX idx_users_jobposition ON users(job_position_id);

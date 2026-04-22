ALTER TABLE usuarios
ADD COLUMN debe_cambiar_password BOOLEAN NOT NULL DEFAULT TRUE AFTER password_hash;

CREATE INDEX idx_debe_cambiar_password
ON usuarios (debe_cambiar_password);

UPDATE usuarios
SET debe_cambiar_password = FALSE
WHERE rol IN ('especialista', 'admin');

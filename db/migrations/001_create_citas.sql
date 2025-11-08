-- Crea tabla citas y asegura trigger para updated_at.
CREATE TABLE IF NOT EXISTS citas (
  id_cita SERIAL PRIMARY KEY,
  id_paciente INT NOT NULL,
  id_medico INT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  canal VARCHAR(10) NOT NULL CHECK (canal IN ('API', 'SMS', 'WEB')),
  estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_citas ON citas;

CREATE TRIGGER set_updated_at_citas
BEFORE UPDATE ON citas
FOR EACH ROW
EXECUTE FUNCTION trg_set_updated_at();

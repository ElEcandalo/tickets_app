-- Crear tabla mailing_list para almacenar emails de invitados
CREATE TABLE IF NOT EXISTS mailing_list (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para búsquedas por email
CREATE INDEX IF NOT EXISTS idx_mailing_list_email ON mailing_list(email);

-- Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_mailing_list_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mailing_list_updated_at
  BEFORE UPDATE ON mailing_list
  FOR EACH ROW
  EXECUTE FUNCTION update_mailing_list_updated_at();

-- Comentarios
COMMENT ON TABLE mailing_list IS 'Lista de emails de invitados para uso interno';
COMMENT ON COLUMN mailing_list.email IS 'Email único del invitado';
COMMENT ON COLUMN mailing_list.nombre IS 'Nombre del invitado (opcional)'; 
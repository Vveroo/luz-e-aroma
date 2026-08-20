-- Execute no SQL Editor do projeto Supabase.
ALTER TABLE reservas
  ADD COLUMN IF NOT EXISTS valor_final NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS forma_pagamento TEXT;

ALTER TABLE reservas
  DROP CONSTRAINT IF EXISTS reservas_forma_pagamento_check;

ALTER TABLE reservas
  ADD CONSTRAINT reservas_forma_pagamento_check
  CHECK (forma_pagamento IS NULL OR forma_pagamento IN ('dinheiro', 'credito', 'debito', 'pix'));
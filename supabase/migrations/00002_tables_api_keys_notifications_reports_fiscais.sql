-- ============================================================
-- GUARDIAO FLORESTAL - Migration 00002
-- Novas tabelas: fiscais, api_keys, notifications, reports
-- Seed data baseado nos mocks existentes
-- ============================================================

-- 5. fiscais (perfis de auditores/fiscais, sem autenticação)
CREATE TABLE fiscais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  fiscal_id TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. api_keys (autenticação de dispositivos ESP32/Arduino)
CREATE TABLE api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key_hash TEXT UNIQUE NOT NULL,
  description TEXT,
  tree_id UUID REFERENCES trees(id) ON DELETE SET NULL,
  permissions JSONB DEFAULT '{}',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_api_keys_tree ON api_keys(tree_id);

-- 7. notifications (notificações push, SMS, email)
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fiscai_id UUID REFERENCES fiscais(id) ON DELETE CASCADE,
  alert_id UUID REFERENCES alerts(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('push','sms','email')),
  channel TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);
CREATE INDEX idx_notifications_fiscai ON notifications(fiscai_id);
CREATE INDEX idx_notifications_read ON notifications(read) WHERE read = false;

-- 8. reports (relatórios gerados automaticamente ou manualmente)
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fiscai_id UUID REFERENCES fiscais(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('validation','inspection','monthly','emergency','custom')),
  filters JSONB,
  data JSONB,
  file_url TEXT,
  format TEXT DEFAULT 'pdf',
  generated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_reports_fiscai ON reports(fiscai_id);
CREATE INDEX idx_reports_type ON reports(type);

-- ============================================================
-- SEED DATA
-- ============================================================

-- fiscais (baseado nos fiscais dos mockValidations)
INSERT INTO fiscais (name, fiscal_id, email) VALUES
  ('Carlos Silva', 'FIS-001', 'carlos.silva@guardiaoflorestal.gov.br'),
  ('Ana Paula', 'FIS-002', 'ana.paula@guardiaoflorestal.gov.br'),
  ('Roberto Lima', 'FIS-003', 'roberto.lima@guardiaoflorestal.gov.br');

-- trees (baseado no mockTrees, com UUIDs fixos para referência nos seeds seguintes)
INSERT INTO trees (id, nfc_id, species, age, latitude, longitude, health, temperature, status, sensor_connected, registration_date, manejo, diameter, height, image_url, location, base_diameter, base_height)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'NFC-IPE-001', 'Ipê Roxo (Handroanthus impetiginosus)', 45, -3.1190, -60.0217, 'excellent', 28.5, 'safe', true, '2024-01-15', 'sustentável', 65, 18.5, NULL, '-3.1190, -60.0217', '65', '18.5'),
  ('00000000-0000-0000-0000-000000000002', 'NFC-JAT-002', 'Jatobá (Hymenaea courbaril)', 60, -3.1195, -60.0220, 'good', 29.2, 'safe', true, '2024-01-15', 'permanente', 80, 22.0, NULL, '-3.1195, -60.0220', '80', '22.0'),
  ('00000000-0000-0000-0000-000000000003', 'NFC-MAH-003', 'Mogno (Swietenia macrophylla)', 38, -3.1200, -60.0225, 'excellent', 42.8, 'critical', true, '2024-02-10', 'sustentável', 55, 16.0, NULL, '-3.1200, -60.0225', '55', '16.0'),
  ('00000000-0000-0000-0000-000000000004', 'NFC-CED-004', 'Cedro (Cedrela fissilis)', 52, -3.1185, -60.0212, 'good', 27.8, 'safe', true, '2024-01-20', 'permanente', 70, 20.5, NULL, '-3.1185, -60.0212', '70', '20.5'),
  ('00000000-0000-0000-0000-000000000005', 'NFC-PER-005', 'Peroba Rosa (Aspidosperma polyneuron)', 41, -3.1205, -60.0230, 'fair', 35.5, 'warning', true, '2024-03-05', 'sustentável', 58, 17.0, NULL, '-3.1205, -60.0230', '58', '17.0'),
  ('00000000-0000-0000-0000-000000000006', 'NFC-ARO-006', 'Aroeira (Myracrodruon urundeuva)', 55, -3.1180, -60.0208, 'excellent', 28.0, 'safe', true, '2024-01-25', 'permanente', 72, 19.5, NULL, '-3.1180, -60.0208', '72', '19.5');

-- sensor_readings (histórico dos sensores)
INSERT INTO sensor_readings (tree_id, temp, umidade, gas, alarme, fogo, msg) VALUES
  ('00000000-0000-0000-0000-000000000001', 25.0, 72, 150, false, 0, 'Normal'),
  ('00000000-0000-0000-0000-000000000001', 24.0, 74, 148, false, 0, 'Normal'),
  ('00000000-0000-0000-0000-000000000001', 23.0, 76, 145, false, 0, 'Normal'),
  ('00000000-0000-0000-0000-000000000001', 24.0, 73, 147, false, 0, 'Normal'),
  ('00000000-0000-0000-0000-000000000001', 26.0, 70, 152, false, 0, 'Normal'),
  ('00000000-0000-0000-0000-000000000001', 28.0, 68, 155, false, 0, 'Normal'),
  ('00000000-0000-0000-0000-000000000001', 29.0, 65, 160, false, 0, 'Normal'),
  ('00000000-0000-0000-0000-000000000003', 25.0, 71, 148, false, 0, 'Normal'),
  ('00000000-0000-0000-0000-000000000003', 24.0, 73, 146, false, 0, 'Normal'),
  ('00000000-0000-0000-0000-000000000003', 23.0, 75, 144, false, 0, 'Normal'),
  ('00000000-0000-0000-0000-000000000003', 24.0, 72, 147, false, 0, 'Normal'),
  ('00000000-0000-0000-0000-000000000003', 28.0, 67, 200, false, 0, 'Temperatura elevada'),
  ('00000000-0000-0000-0000-000000000003', 42.0, 45, 890, true, 1, 'ALARME DE FOGO'),
  ('00000000-0000-0000-0000-000000000003', 38.0, 50, 750, true, 1, 'Resfriando'),
  ('00000000-0000-0000-0000-000000000005', 24.0, 74, 149, false, 0, 'Normal'),
  ('00000000-0000-0000-0000-000000000005', 23.0, 76, 147, false, 0, 'Normal'),
  ('00000000-0000-0000-0000-000000000005', 22.0, 78, 145, false, 0, 'Normal'),
  ('00000000-0000-0000-0000-000000000005', 23.0, 75, 148, false, 0, 'Normal'),
  ('00000000-0000-0000-0000-000000000005', 27.0, 69, 180, false, 0, 'Temperatura elevada'),
  ('00000000-0000-0000-0000-000000000005', 35.0, 55, 300, false, 0, 'Temperatura elevada'),
  ('00000000-0000-0000-0000-000000000005', 32.0, 60, 250, false, 0, 'Resfriando');

-- alerts (baseado no mockAlerts)
INSERT INTO alerts (id, tree_id, type, severity, message, temperature, resolved, resolved_at) VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000003', 'fire', 'critical', 'Temperatura crítica detectada: 42.8°C', 42.8, false, NULL),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000005', 'temperature', 'medium', 'Temperatura elevada: 35.5°C', 35.5, false, NULL),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000002', 'temperature', 'low', 'Temperatura acima do normal: 32.1°C', 32.1, true, NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'offline', 'medium', 'Sensor desconectado por 10 minutos', NULL, true, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000004', 'intrusion', 'high', 'Movimento detectado fora do horário autorizado', NULL, true, NOW() - INTERVAL '1 day');

-- validations (baseado no mockValidations)
INSERT INTO validations (tree_id, fiscal_name, fiscal_id, nfc_verified, sensor_snapshot, inspection_data, biomass_calculated, notes, photos_count, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Carlos Silva', 'FIS-001', true,
   '{"temp": 28.5, "umidade": 65, "gas": 155, "alarme": false, "fogo": 0}'::jsonb,
   '{"biometria": "ok", "corte_ilegal": false, "solo": "normal", "copa": "integral"}'::jsonb,
   '2.45 tCO2', 'Árvore em excelente estado. Sensores funcionando normalmente.', 3, 'approved'),
  ('00000000-0000-0000-0000-000000000002', 'Ana Paula', 'FIS-002', true,
   '{"temp": 29.0, "umidade": 63, "gas": 152, "alarme": false, "fogo": 0}'::jsonb,
   '{"biometria": "ok", "corte_ilegal": false, "solo": "normal", "copa": "integral"}'::jsonb,
   '3.10 tCO2', 'Verificação concluída. Árvore preservada conforme plano.', 2, 'approved'),
  ('00000000-0000-0000-0000-000000000003', 'Roberto Lima', 'FIS-003', true,
   NULL,
   '{"biometria": "ok", "corte_ilegal": false, "solo": "seco", "copa": "parcial"}'::jsonb,
   '2.10 tCO2', 'Sensor apresentou falha na conexão. Necessário manutenção.', 1, 'pending'),
  ('00000000-0000-0000-0000-000000000004', 'Carlos Silva', 'FIS-001', true,
   '{"temp": 27.5, "umidade": 68, "gas": 148, "alarme": false, "fogo": 0}'::jsonb,
   '{"biometria": "ok", "corte_ilegal": false, "solo": "normal", "copa": "integral"}'::jsonb,
   '2.85 tCO2', 'Situação regular. Área bem preservada.', 2, 'approved');

-- api_keys (chaves para dispositivos de teste)
INSERT INTO api_keys (key_hash, description, tree_id, permissions) VALUES
  ('$2a$10$x3a1q2w3e4r5t6y7u8i9o0p1q2w3e4r5t6y7u8i9o', 'ESP32 - Árvore 001', '00000000-0000-0000-0000-000000000001', '{"read": true, "write": true}'::jsonb),
  ('$2a$10$y7u8i9o0p1q2w3e4r5t6y7u8i9o0p1q2w3e4r5t6y', 'ESP32 - Árvore 003', '00000000-0000-0000-0000-000000000003', '{"read": true, "write": true}'::jsonb);

-- notifications (notificações de exemplo)
INSERT INTO notifications (fiscai_id, alert_id, type, title, message) VALUES
  ((SELECT id FROM fiscais WHERE fiscal_id = 'FIS-001'), '00000000-0000-0000-0000-000000000010', 'push',
   '🚨 Alerta Crítico - Fogo Detectado',
   'Temperatura crítica de 42.8°C detectada no Mogno (NFC-MAH-003). Risco de incêndio iminente!'),
  ((SELECT id FROM fiscais WHERE fiscal_id = 'FIS-002'), '00000000-0000-0000-0000-000000000010', 'push',
   '🚨 Alerta Crítico - Fogo Detectado',
   'Temperatura crítica de 42.8°C detectada no Mogno (NFC-MAH-003). Risco de incêndio iminente!'),
  ((SELECT id FROM fiscais WHERE fiscal_id = 'FIS-003'), '00000000-0000-0000-0000-000000000010', 'sms',
   '🚨 Alerta Crítico - Fogo Detectado',
   'ALERTA: Fogo detectado na Zona B, Setor 2. Árvore: Mogno. Temperatura: 42.8°C. Dirija-se ao local imediatamente.'),
  ((SELECT id FROM fiscais WHERE fiscal_id = 'FIS-001'), '00000000-0000-0000-0000-000000000011', 'push',
   '⚠️ Alerta de Temperatura Elevada',
   'Peroba Rosa (NFC-PER-005) registrando 35.5°C. Monitore a situação.');

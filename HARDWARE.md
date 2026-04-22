# 🔌 Guia de Hardware - Cerca Digital Inteligente

Este documento detalha todo o hardware necessário para implementar o sistema de monitoramento de árvores.

---

## 💰 Custo Total por Árvore: **R$ 87 - R$ 125**

---

## 📋 Lista de Componentes

### 1. 🧠 ESP32 Dev Board (Cérebro do Sistema)

**Modelo recomendado:** ESP32 DevKit V1 ou ESP32 WROOM-32

**Especificações:**
- Processador: Dual-core Xtensa LX6 @ 240 MHz
- Memória: 520 KB SRAM, 4 MB Flash
- Conectividade: WiFi 802.11 b/g/n + Bluetooth 4.2/BLE
- GPIO: 34 pinos configuráveis
- ADC: 18 canais de 12 bits
- Tensão: 3.3V (regulador interno para 5V)

**Preço:** R$ 30 - R$ 45

**Onde comprar:**
- Mercado Livre
- AliExpress (mais barato, demora mais)
- Lojas de eletrônica locais

---

### 2. 📱 Etiqueta NFC (Identidade da Árvore)

**Modelo recomendado:** NTAG215 ou NTAG216

**Especificações:**
- Protocolo: NFC Type 2 (ISO14443A)
- Frequência: 13.56 MHz
- Memória: 
  - NTAG213: 144 bytes
  - NTAG215: 504 bytes (recomendado)
  - NTAG216: 888 bytes
- Alcance de leitura: 1-5 cm
- Formato: Adesivo circular, tag de chaveiro ou cartão

**Preço:** R$ 2 - R$ 5 (comprar em lote sai mais barato)

**Dados armazenados:**
```
ID Único: NFC-IPE-001
Espécie: Ipê Roxo
GPS: -3.1190, -60.0217
Data Cadastro: 2024-01-15
URL: https://sistema.com/tree/001
```

**Onde comprar:**
- AliExpress (lote de 10-100 unidades)
- Amazon
- Lojas de RFID especializadas

---

### 3. 🔥 Sensor de Chama/Fogo (Detecção de Incêndio)

**Modelo recomendado:** Sensor IR de Chama KY-026 ou similar

**Especificações:**
- Detecção: Luz infravermelha de chamas (760-1100 nm)
- Alcance: 60-100 cm
- Ângulo de detecção: ~60°
- Tensão: 3.3V - 5V
- Saída: Digital (HIGH/LOW) e Analógica
- Tempo de resposta: < 1 segundo

**Preço:** R$ 8 - R$ 15

**Instalação:**
- Posicionar com visão 360° se possível
- Proteger da luz solar direta
- Calibrar sensibilidade via potenciômetro

---

### 4. 🌡️ Sensor de Temperatura (Monitoramento Térmico)

**Opção 1: DS18B20 (Recomendado)**
- Faixa: -55°C a +125°C
- Precisão: ±0.5°C
- Interface: One-Wire (usa apenas 1 GPIO)
- À prova d'água: Versão encapsulada disponível
- Preço: R$ 10 - R$ 15

**Opção 2: DHT22**
- Temperatura: -40°C a +80°C (±0.5°C)
- Umidade: 0-100% (±2%)
- Vantagem: Mede umidade também
- Preço: R$ 15 - R$ 20

**Onde instalar:**
- Na sombra da árvore (evitar sol direto)
- 1.5m - 2m de altura
- Protegido de chuva

---

### 5. 🔋 Sistema de Energia

#### Opção 1: Bateria LiPo (Básico)
- **Modelo:** Bateria LiPo 3.7V 2000-3000 mAh
- **Autonomia:** 7-15 dias (depende da frequência de leitura)
- **Preço:** R$ 20 - R$ 30
- **Carregamento:** Manual periódico

#### Opção 2: Solar + Bateria (Recomendado)
- **Painel Solar:** 5V 1-2W (policristalino)
- **Bateria:** LiPo 3.7V 3000 mAh
- **Controlador de Carga:** TP4056 ou similar
- **Autonomia:** Indefinida (autossustentável)
- **Preço total:** R$ 40 - R$ 50

**Cálculo de consumo:**
```
ESP32: ~80mA em uso, ~10mA em deep sleep
Sensores: ~5-10mA
Leitura a cada 5 min: ~15h de deep sleep por dia
Consumo médio: ~15-20mA
Bateria 3000mAh: 3000/20 = 150 horas = 6 dias
```

---

### 6. 🛡️ Case/Gabinete Impermeável

**Especificações:**
- **Proteção:** IP65 ou IP67 (à prova d'água e poeira)
- **Material:** ABS, policarbonato ou PVC
- **Tamanho:** 100x68x50mm (aproximado)
- **Características:**
  - Transparente ou com janela para painel solar
  - Furos para ventilação (com membrana)
  - Suporte para fixação na árvore

**Preço:** R$ 10 - R$ 20

**Opção DIY:** Caixa de derivação elétrica IP65 (mais barata)

---

## 🔧 Componentes Adicionais (Opcionais)

### Sensores Extras

| Sensor | Função | Preço | Prioridade |
|--------|--------|-------|------------|
| **Sensor de Umidade do Solo** | Monitorar saúde da árvore | R$ 8-12 | Média |
| **Acelerômetro/Giroscópio** | Detectar queda ou corte | R$ 10-15 | Alta |
| **Sensor de Movimento PIR** | Detectar intrusão | R$ 5-10 | Média |
| **Sensor de Luz (LDR)** | Monitorar cobertura florestal | R$ 2-5 | Baixa |
| **Câmera ESP32-CAM** | Captura de imagens | R$ 25-35 | Alta |

### Conectividade

| Item | Função | Preço |
|------|--------|-------|
| **Antena Externa WiFi** | Melhorar alcance em floresta | R$ 15-25 |
| **Módulo LoRa** | Comunicação de longo alcance | R$ 30-50 |
| **SIM800L (GSM)** | Enviar SMS em emergências | R$ 25-40 |

---

## 🛠️ Ferramentas Necessárias

### Para Montagem
- Ferro de solda + solda
- Multímetro
- Chave de fenda
- Alicate de corte
- Pistola de cola quente
- Fita isolante

### Para Programação
- Cabo Micro USB
- Computador com Arduino IDE ou PlatformIO
- Driver CH340/CP2102 (para ESP32)

---

## 📐 Esquema de Conexão

```
ESP32 DevKit V1
├─ GPIO 4  → DS18B20 (Temperatura)
├─ GPIO 5  → Sensor de Chama (Digital)
├─ GPIO 34 → Sensor de Chama (Analógico)
├─ GPIO 21 → SDA (I2C para expansões)
├─ GPIO 22 → SCL (I2C para expansões)
├─ 3.3V    → VCC dos sensores
├─ GND     → GND comum
└─ VIN     → 5V da bateria/solar

Etiqueta NFC
└─ Afixada fisicamente na árvore
   Leitura: Smartphone do fiscal
```

---

## 📦 Lista de Compras Completa

### Kit Básico (R$ 87-105)
- [ ] 1x ESP32 DevKit V1
- [ ] 1x Etiqueta NFC NTAG215
- [ ] 1x Sensor de Chama IR
- [ ] 1x Sensor DS18B20 à prova d'água
- [ ] 1x Bateria LiPo 3.7V 2000mAh
- [ ] 1x Case IP65
- [ ] Cabos jumper (20 unidades)
- [ ] Fita dupla-face para fixação

### Kit Completo Solar (R$ 125-145)
- [ ] Tudo do Kit Básico
- [ ] 1x Painel Solar 5V 2W
- [ ] 1x Módulo TP4056 (carregador)
- [ ] 1x Bateria LiPo 3.7V 3000mAh

### Kit Profissional (R$ 180-220)
- [ ] Tudo do Kit Completo
- [ ] 1x ESP32-CAM (câmera)
- [ ] 1x Acelerômetro MPU6050
- [ ] 1x Sensor de umidade do solo
- [ ] 1x Módulo LoRa RFM95

---

## 🏪 Fornecedores Recomendados

### Brasil (Entrega Rápida)
- **FilipeFlop** - filipeflop.com
- **Eletrogate** - eletrogate.com
- **Curto Circuito** - curtocircuito.com.br
- **Mercado Livre** - mercadolivre.com.br

### Internacional (Mais Barato)
- **AliExpress** - aliexpress.com (30-60 dias)
- **Banggood** - banggood.com (20-45 dias)
- **Amazon** - amazon.com (15-30 dias)

### Compra em Lote (10+ unidades)
- Contactar distribuidores diretos na China
- Economia de 30-50% no preço unitário

---

## 💡 Dicas de Economia

1. **Compre em lote**: 10+ kits = desconto significativo
2. **AliExpress**: Até 60% mais barato, mas demora 30-60 dias
3. **Reutilize materiais**: Cases podem ser caixas adaptadas
4. **Versão básica primeiro**: Adicione sensores extras depois
5. **Solar é investimento**: Economiza bateria e manutenção

---

## 🔐 Segurança e Proteção

### Proteção Contra Vandalismo
- Fixar case com parafusos de segurança
- Instalar a 2-3m de altura (dificulta acesso)
- Case camuflado (cor verde/marrom)
- Alarme de remoção (acelerômetro)

### Proteção Ambiental
- Silicone nas junções do case
- Dessecante (sílica gel) dentro do case
- Ventilação com membrana impermeável
- Revestimento conformal na placa (opcional)

---

## 📊 Comparação de Custos

| Componente | Básico | Completo | Profissional |
|-----------|--------|----------|--------------|
| ESP32 | R$ 35 | R$ 35 | R$ 35 |
| NFC Tag | R$ 3 | R$ 3 | R$ 3 |
| Sensor Chama | R$ 10 | R$ 10 | R$ 10 |
| Temperatura | R$ 12 | R$ 12 | R$ 12 |
| Energia | R$ 20 | R$ 45 | R$ 50 |
| Case | R$ 12 | R$ 15 | R$ 20 |
| Extras | - | - | R$ 50 |
| **TOTAL** | **R$ 92** | **R$ 120** | **R$ 180** |

---

## 🚀 Próximos Passos

Depois de adquirir o hardware:

1. ✅ **Testar componentes** individualmente
2. ✅ **Programar ESP32** com Arduino IDE
3. ✅ **Gravar etiquetas NFC** com dados de teste
4. ✅ **Montar protótipo** em protoboard
5. ✅ **Testar sistema completo** em bancada
6. ✅ **Instalar em campo** (piloto com 1-3 árvores)
7. ✅ **Coletar dados** por 1-2 semanas
8. ✅ **Escalar produção** para todas as árvores

---

## 📞 Suporte Técnico

**Dúvidas sobre hardware?**
- Fórum Arduino: forum.arduino.cc
- Grupo ESP32 Brasil (Telegram)
- Reddit: r/esp32

---

**Hardware escolhido? Próximo passo: [Programação do ESP32](ESP32_SETUP.md)** 🚀

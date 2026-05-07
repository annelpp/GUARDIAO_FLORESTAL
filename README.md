# 🌳 Cerca Digital Inteligente

Sistema completo de monitoramento e rastreabilidade de árvores nobres usando tecnologia NFC + IoT (ESP32/Arduino) para preservação florestal e detecção precoce de incêndios.

![Status](https://img.shields.io/badge/status-active-success.svg)
![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![React](https://img.shields.io/badge/react-18.3.1-61dafb.svg)
![Hardware](https://img.shields.io/badge/hardware-ESP32%20%7C%20C%2B%2B-green.svg)

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [A Nova Arquitetura de Validação](#a-nova-arquitetura-de-validação)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Requisitos do Sistema](#requisitos-do-sistema)
- [Instalação e Configuração](#instalação-e-configuração)
- [Como Executar](#como-executar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Hardware Necessário](#hardware-necessário)

---

## 🎯 Sobre o Projeto

O **Cerca Digital Inteligente** é uma solução inovadora para preservação de florestas de alto valor, combinando:

- **NFC (Near Field Communication)**: Identificação individual e rastreabilidade de cada árvore.
- **Microcontroladores (ESP32/Arduino)**: Estações base de baixo custo para monitoramento do perímetro em tempo real.
- **Detecção Precoce Inteligente**: Sistema de alertas de incêndio e anomalias térmicas, com análise local via hardware e visualização instantânea via Web Serial API.

### O Diferencial Único

**Auditoria Simultânea de Perímetro e Indivíduo:**
Nós separamos a monitorização do ambiente da validação da árvore, criando um processo duplo e robusto:
1. **Prova Viva (Estação de Área IoT)**: O fiscal conecta o sistema à uma base ESP32/Arduino via USB, que monitora continuamente todo o perímetro da área inspecionada (temperatura, gás e chamas) através de um *Monitor Serial em tempo real*.
2. **Prova Física (NFC + Check-list Humano)**: Enquanto a estação monitora a área, o fiscal realiza a ronda livremente, "bipando" tags NFC para atestar a localização e inserindo dados de saúde de árvores específicas.

A validação de uma árvore só é atestada se as informações físicas dela baterem e se a *Estação de Área* afirmar que o ambiente ao redor está seguro no momento da inspeção!

---

## ⚡ Funcionalidades

### 🏠 Landing Page
- Apresentação profissional do projeto
- Explicação do conceito e diferencial
- Call-to-action para acessar o sistema

### 📊 Dashboard de Monitoramento
- Visão geral em tempo real de todas as árvores
- Mapa interativo com localização das árvores
- Gráficos de temperatura histórica
- Alertas ativos e status do sistema

### 🌲 Cadastro de Árvores
- Registro completo de novas árvores
- Sistema de busca, filtros e gerenciamento de dados cadastrais
- Visualização de informações detalhadas e histórico

### ✅ Central de Operações em Campo (Validação)
**O coração do sistema!** Uma interface dupla para o fiscal em campo:
- **Painel IoT (Estação de Área)**
  - Conexão nativa com a placa via Web Serial API diretamente do navegador Chrome/Edge.
  - Correção implementada de DTR/RTS (Sem travamentos de reset no ESP32).
  - Terminal de console de monitoramento rodando *live*, com parser inteligente e scroll automático.
  - Cartões de status dinâmicos. A temperatura muda de cor indicando níveis de risco (Laranja >= 32°C, Vermelho >= 40°C).
- **Painel Humano (Auditoria NFC)**
  - Fluxo assíncrono. O fiscal pode validar inúmeras árvores sem desconectar o Arduino.
  - Formulário completo: Condição do tronco, folhagem, integridade da Tag, checklist de corte ilegal e parecer técnico.
  - Geração de Certificado combinando o Status Humano e o Status do Perímetro.

### 🚨 Central de Alertas
- Lista de alertas em tempo real e filtros por tipo e severidade
- Protocolos de resposta por tipo de alerta: Incêndio, Temperatura Elevada, Sensor Offline, Intrusão.

### 📈 Relatórios e Analytics
- KPIs principais do sistema (crescimento, distribuição de alertas, saúde das árvores)
- Resumo executivo e exportação de relatórios

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18.3.1** - Biblioteca JavaScript para interfaces
- **TypeScript** - Tipagem estática
- **Vite 6.3.5** - Build tool e dev server super rápido
- **React Router 7.13.0** - Navegação entre páginas

### UI/UX
- **Tailwind CSS 4.1.12** - Framework CSS utilitário
- **Radix UI** - Componentes acessíveis e sem estilo
- **Lucide React** - Biblioteca de ícones
- **Recharts 2.15.2** - Biblioteca de gráficos

### Mapas e Geolocalização
- **Leaflet** - Biblioteca JS open-source para mapas interativos
- **React-Leaflet (v4.2.1)** - Componentes React para o Leaflet

### Hardware & Integração
- **Web Serial API**: Integração nativa navegador-hardware para captura de dados do ESP32 via cabo USB, parseamento de JSON e tratamento de logs.
- **C++/PlatformIO**: Código fonte do microcontrolador utilizando bibliotecas da Adafruit (`DHT sensor library`, `Adafruit Unified Sensor`).

---

## 💻 Requisitos do Sistema

### Software Necessário
- **Node.js**: versão 22.x ou superior
- **pnpm**: versão 8.x ou superior (gerenciador de pacotes recomendado)
- **Navegador Moderno**: Google Chrome ou Microsoft Edge (obrigatório para acesso à Web Serial API na página de validação).

### Verificar Instalações
```bash
node --version # Deve retornar: v22.x.x ou superior
pnpm --version # Deve retornar: 8.x.x ou superior
git --version

### Instalar pnpm (se necessário)
```bash
# Via npm
npm install -g pnpm

# Via Homebrew (macOS)
brew install pnpm

# Via Scoop (Windows)
scoop install pnpm
```

---

## 🚀 Instalação e Configuração

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd cerca-digital-inteligente
```

### 2. Instale as Dependências

```bash
# Usando pnpm (recomendado)
pnpm install

# OU usando npm
npm install

# OU usando yarn
yarn install
```

### 3. Estrutura de Arquivos

Após a instalação, a estrutura do projeto será:

```
cerca-digital-inteligente/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── ui/              # Componentes de UI reutilizáveis
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── TreeMap.tsx      # Componente do Mapa Interativo
│   │   │   └── figma/
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── TreesPage.tsx
│   │   │   ├── ValidationPage.tsx
│   │   │   ├── AlertsPage.tsx
│   │   │   └── ReportsPage.tsx
│   │   ├── data/
│   │   │   └── mockData.ts      # Dados simulados
│   │   ├── routes.tsx
│   │   └── App.tsx
│   └── styles/
│       ├── index.css
│       ├── tailwind.css
│       ├── theme.css
│       └── fonts.css
├── package.json
├── vite.config.ts
├── postcss.config.mjs
└── README.md
```

---

## 🎮 Como Executar

### Modo Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
pnpm dev

# OU
npm run dev

# O aplicativo estará disponível em:
# http://localhost:5173
```

### Build de Produção

```bash
# Gerar build otimizado
pnpm build

# OU
npm run build

# Os arquivos serão gerados na pasta: dist/
```

### Preview do Build

```bash
# Visualizar build de produção localmente
pnpm preview

# OU
npm run preview
```

---

## 📁 Estrutura do Projeto

### Páginas Principais

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/` | LandingPage | Página inicial de apresentação |
| `/dashboard` | Dashboard | Painel de monitoramento em tempo real |
| `/trees` | TreesPage | Cadastro e gerenciamento de árvores |
| `/validation` | ValidationPage | Sistema de validação em campo |
| `/alerts` | AlertsPage | Central de alertas e protocolos |
| `/reports` | ReportsPage | Relatórios e analytics |

### Dados Mockados

O sistema utiliza dados simulados localizados em `/src/app/data/mockData.ts`:

- **mockTrees**: 6 árvores de exemplo com dados completos
- **mockAlerts**: 5 alertas de diferentes tipos e severidades
- **mockValidations**: 4 validações em campo
- **temperatureHistory**: Histórico de temperatura das últimas 24h
- **alertStats**: Estatísticas de alertas
- **systemStats**: Estatísticas gerais do sistema

### Componentes de UI

Todos os componentes de UI estão em `/src/app/components/ui/` e incluem:

- **Button, Input, Label** - Formulários
- **Card, Badge, Alert** - Containers e notificações
- **Dialog, Select, Checkbox** - Interações
- **Table, Tabs, Progress** - Visualização de dados
- **Tooltip, Popover, Sheet** - Overlays
- E muitos outros...

---

## 🔮 Roadmap

### Próximas Funcionalidades

- [ ] **Integração com Supabase**
  - Persistência de dados em banco real
  - Autenticação de usuários
  - Sincronização em tempo real

- [ ] **Sistema de Notificações**
  - Push notifications para alertas críticos
  - SMS para emergências
  - Email reports automáticos

- [ ] **Integração com ESP32**
  - API real para conexão com sensores
  - MQTT para comunicação IoT
  - Dashboard de status dos sensores

- [ ] **Mobile App**
  - App nativo para fiscais
  - Leitura NFC real
  - Modo offline

- [ ] **Machine Learning**
  - Predição de risco de incêndio
  - Detecção de anomalias
  - Recomendações de manutenção

- [ ] **Blockchain**
  - Certificação imutável de origem
  - Smart contracts para manejo sustentável
  - Rastreabilidade end-to-end

---

## 🔌 Hardware Necessário

### Kit Básico por Árvore (< R$ 100)

1. **ESP32 Dev Board** (~R$ 30-40)
   - Processador: Dual-core 240 MHz
   - Conectividade: WiFi + Bluetooth nativo
   - GPIO: Múltiplos pinos para sensores

2. **Etiqueta NFC** (~R$ 2-5)
   - Protocolo: NFC Type 2 (NTAG213/215/216)
   - Memória: 144-888 bytes
   - Leitura: Smartphones Android/iOS

3. **Sensor de Chama IR** (~R$ 15-20)
   - Detecção: Chamas e radiação infravermelha
   - Alcance: 60-100 cm
   - Resposta: < 1 segundo

4. **Sensor de Temperatura** (~R$ 10-15)
   - Modelo sugerido: DS18B20 ou DHT22
   - Faixa: -55°C a +125°C
   - Precisão: ±0.5°C

5. **Bateria/Solar** (~R$ 20-30)
   - Bateria: LiPo 3.7V 2000mAh
   - Painel solar: 5V 1W (opcional)
   - Autonomia: 7-30 dias

6. **Case Impermeável** (~R$ 10-15)
   - Proteção: IP65/IP67
   - Material: ABS ou policarbonato

### Ferramentas de Desenvolvimento

- **Arduino IDE** ou **PlatformIO** - Programação do ESP32
- **App NFC Tools** - Gravação das etiquetas NFC
- **MQTT Broker** - Mosquitto ou HiveMQ (comunicação)

---

## 📊 Dados do Sistema

### Estatísticas Atuais (Mockadas)

- **156 árvores** cadastradas e monitoradas
- **152 sensores** ativos (97.4% uptime)
- **450 hectares** de área monitorada
- **82 validações** realizadas no mês
- **5 alertas** ativos no momento
- **99.7%** de disponibilidade do sistema

### Espécies Monitoradas

- Ipê Roxo (Handroanthus impetiginosus)
- Jatobá (Hymenaea courbaril)
- Mogno (Swietenia macrophylla)
- Cedro (Cedrela fissilis)
- Peroba Rosa (Aspidosperma polyneuron)
- Aroeira (Myracrodruon urundeuva)

---

## 🤝 Contribuindo

Este é um projeto privado em desenvolvimento. Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto é privado e proprietário. Todos os direitos reservados.

---

## 📞 Suporte

Para dúvidas e suporte:

- **Email**: suporte@cercadigital.com.br
- **Documentação**: [Link para docs]
- **Issues**: Use a aba Issues do GitHub

---

## 🌟 Agradecimentos

- Comunidade React e Tailwind CSS
- Projeto Recharts por visualizações incríveis
- Radix UI por componentes acessíveis
- Lucide por ícones lindos e consistentes

---

**Desenvolvido com 💚 para preservação florestal**

*Última atualização: Abril 2026*

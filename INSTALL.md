# 🚀 Guia de Instalação Rápida - Cerca Digital Inteligente

Este guia irá ajudá-lo a configurar o projeto do zero em poucos minutos.

---

## ⚡ Instalação Rápida (3 passos)

### Passo 1: Pré-requisitos

Certifique-se de ter instalado:

- **Node.js 18+** → [Download](https://nodejs.org/)
- **pnpm** → Instale com: `npm install -g pnpm`

### Passo 2: Instalar Dependências

```bash
# Clone o repositório (se ainda não clonou)
git clone <url-do-repositorio>
cd cerca-digital-inteligente

# Instale todas as dependências
pnpm install
```

### Passo 3: Executar

```bash
# Inicie o servidor de desenvolvimento
pnpm dev
```

✅ **Pronto!** Acesse http://localhost:5173

---

## 🔧 Comandos Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor dev (porta 5173)

# Build
pnpm build            # Gera build de produção
pnpm preview          # Testa o build localmente

# Limpeza
rm -rf node_modules   # Remove dependências
pnpm install          # Reinstala tudo
```

---

## 📦 Dependências Principais

O projeto usa as seguintes tecnologias principais:

### Core
- React 18.3.1
- TypeScript
- Vite 6.3.5

### Roteamento
- react-router 7.13.0

### UI/Styling
- Tailwind CSS 4.1.12
- Radix UI (componentes)
- lucide-react (ícones)

### Gráficos
- recharts 2.15.2

### Utilitários
- date-fns 3.6.0
- clsx 2.1.1
- tailwind-merge 3.2.0

**Total de dependências:** ~65 pacotes
**Tempo de instalação:** ~2-5 minutos (dependendo da internet)

---

## 🐛 Solução de Problemas

### Erro: "Cannot find module"

```bash
# Limpe o cache e reinstale
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Erro: "Port 5173 already in use"

```bash
# Opção 1: Mude a porta no vite.config.ts
# Opção 2: Mate o processo na porta 5173
lsof -ti:5173 | xargs kill -9
```

### Erro: "pnpm: command not found"

```bash
# Instale o pnpm globalmente
npm install -g pnpm

# Verifique a instalação
pnpm --version
```

### Erro de Permissão (macOS/Linux)

```bash
# Adicione sudo antes do comando
sudo npm install -g pnpm

# OU configure permissões npm
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Build muito lento

```bash
# Use o pnpm ao invés de npm (é 2x mais rápido)
pnpm install

# Desabilite sourcemaps em produção (vite.config.ts)
build: {
  sourcemap: false
}
```

---

## 🌍 Variáveis de Ambiente

O projeto atualmente não usa variáveis de ambiente (dados são mockados).

Quando integrar com Supabase ou API real, crie um arquivo `.env`:

```env
# .env.local (não commitar!)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
VITE_API_URL=https://api.cercadigital.com.br
```

---

## 📱 Testando em Dispositivos Móveis

### 1. Encontre seu IP local

```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

### 2. Acesse pelo celular

```
http://SEU_IP:5173
Exemplo: http://192.168.1.100:5173
```

**Importante:** Certifique-se de estar na mesma rede WiFi!

---

## 🔒 Segurança

### Antes de Deploy em Produção

- [ ] Remova console.logs
- [ ] Configure variáveis de ambiente
- [ ] Ative HTTPS
- [ ] Configure CORS adequadamente
- [ ] Adicione rate limiting
- [ ] Configure autenticação real
- [ ] Troque dados mockados por API real

---

## 📊 Estrutura de Pastas

```
cerca-digital-inteligente/
│
├── src/
│   ├── app/
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas principais
│   │   ├── data/            # Dados mockados
│   │   ├── routes.tsx       # Configuração de rotas
│   │   └── App.tsx          # Componente raiz
│   │
│   └── styles/              # CSS e Tailwind
│       ├── tailwind.css
│       ├── theme.css
│       └── fonts.css
│
├── package.json             # Dependências
├── vite.config.ts           # Configuração Vite
├── postcss.config.mjs       # Configuração PostCSS
├── README.md                # Documentação completa
└── INSTALL.md               # Este arquivo
```

---

## 🎓 Próximos Passos

Depois de instalar e executar:

1. ✅ Explore a **Landing Page** em `/`
2. ✅ Acesse o **Dashboard** em `/dashboard`
3. ✅ Teste o **Cadastro de Árvores** em `/trees`
4. ✅ Simule uma **Validação** em `/validation`
5. ✅ Veja os **Alertas** em `/alerts`
6. ✅ Analise os **Relatórios** em `/reports`

---

## 💡 Dicas Úteis

### Desenvolvimento Mais Rápido

```bash
# Abra o projeto no VS Code
code .

# Extensões recomendadas:
# - ESLint
# - Tailwind CSS IntelliSense
# - ES7+ React/Redux/React-Native snippets
```

### Hot Reload não funciona?

- Verifique se está usando `pnpm dev` (não `npm`)
- Limpe o cache do browser (Ctrl+Shift+R)
- Reinicie o servidor dev

### Performance em Desenvolvimento

O Vite é extremamente rápido! Se estiver lento:
- Feche outras aplicações
- Verifique se tem antivírus bloqueando
- Use SSD ao invés de HD

---

## 📞 Ajuda

**Problemas na instalação?**

1. Verifique a versão do Node: `node --version` (deve ser 18+)
2. Limpe o cache do pnpm: `pnpm store prune`
3. Tente com npm: `npm install`
4. Verifique conexão com internet
5. Desative VPN/proxy temporariamente

**Ainda com problemas?**
- Crie uma issue no GitHub
- Consulte a [documentação do Vite](https://vitejs.dev)
- Consulte a [documentação do React Router](https://reactrouter.com)

---

## ✅ Checklist de Instalação

- [ ] Node.js 18+ instalado
- [ ] pnpm instalado globalmente
- [ ] Repositório clonado
- [ ] Dependências instaladas (`pnpm install`)
- [ ] Servidor dev rodando (`pnpm dev`)
- [ ] Aplicação acessível em http://localhost:5173
- [ ] Todas as páginas carregando corretamente

---

**Instalação concluída com sucesso? Comece a desenvolver! 🚀**

*Tempo médio de instalação: 5 minutos*

# FundSmart Front-End

## 📚 Tecnologias Utilizadas

- **React 18** – Biblioteca JavaScript para construção de interfaces UI declarativas e componentizadas.
- **Vite** – Bundler rápido e suporte a hot‑module‑replacement (HMR) para desenvolvimento ágil.
- **Tailwind CSS (v4)** – Utility‑first CSS framework que nos permite estilizar tudo usando classes responsivas, mantendo o código CSS praticamente inexistente.
- **React Router DOM** – Gerenciamento de rotas SPA, incluindo rotas privadas e públicas.
- **Axios** – Cliente HTTP configurado com interceptor que injeta automaticamente o token JWT (Laravel Sanctum) em todas as requisições.
- **lucide-react** – Ícones leves e consistentes para a UI.
- **react‑apexcharts** – Biblioteca de gráficos que entrega tanto o donut (KPIs) quanto o gráfico de colunas (despesas por categoria).
- **Context API** – Controle global de autenticação (login/logout) e armazenamento do token no `localStorage`.

## 🎯 O Que o Front‑End Faz?

1. **Autenticação** – Tela de **Login/Registro** que salva o token retornado pela API e o persiste no `localStorage`. O token é enviado em todas as chamadas de API via interceptor.
2. **Dashboard** – Exibe KPIs (receita, despesa, saldo, porcentagem de poupança) e dois widgets:
   - **Gráfico de colunas** de despesas por categoria (dados vindos de `movements_GRAPH`).
   - **Simulador rápido** com controle de valor, frequência (diário/mensal) e quantidade de meses.
   - **Atividades recentes** – Lista as 5 últimas movimentações.
3. **Movimentos** – CRUD completo:
   - **Extrato** (`/extract`) – Tabela filtrável por descrição, categoria, valores e datas. Clique em qualquer linha leva à página de detalhe da movimentação.
   - **Novo Lançamento** (`/movement/new`) – Formulário que preenche automaticamente o tipo (R/D) ao selecionar a categoria.
   - **Detalhe da Movimentação** (`/movement/:id`) – Exibe informações completas (valor, categoria, data, tipo, usuário) com layout premium.
4. **Categorias** – Interface para criar, editar e excluir categorias, com seleção de cor e tipo (Receita/Despesa). Ao salvar, o usuário é redirecionado para criar um novo movimento.
5. **Responsividade** – NavBar fixa no topo que vira um menu hambúrguer em telas menores, garantindo ótima experiência em desktop e mobile.

## 🚀 Como Rodar a Aplicação

```bash
# Clone o repositório
git clone <https://github.com/Martinescomz/frontFundSmart.git>
cd frontFundSmart

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento (Vite)
npm run dev
```

O app será servido em `http://localhost:5173` (ou a porta que o Vite indicar). Certifique‑se de que o back‑end Laravel está rodando em `http://localhost:8000`.

---

> **Nota:** Todas as rotas da API foram adaptadas ao formato retornado pelo Laravel 13 (ex.: campos como `Receita_KPI`, `movements_GRAPH`, `value` formatado como `R$ xx,xx`). O front‑end está pronto para consumir esses dados de forma segura e visualmente atrativa.

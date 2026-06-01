# SIPAN – Sistema Integrado de Proteção Animal

Frontend React integrado à **Sipan.Service.Api** (Node, porta **5089**). **Todos os dados são persistidos no MySQL** via API.

## Desenvolvimento

```bash
# 1. MySQL
cd Sipan.Service.Web
docker compose up -d

# 2. Schema (Adminer :8080 ou cliente MySQL)
#    - database/schema.sql          (tabelas SIPAN + APAC completas)
#    - ou apac_schema.sql na API + database/apac_extended_schema.sql
#
#    Banco já existente (Docker antigo): rode as migrações em database/migrations/
#    Ex.: 001_apac_estoque_limite_baixo.sql — coluna limite_baixo_estoque em apac_estoque

# 3. API
cd ../Sipan.Service.Api
npm install && npm run dev

# 4. Web
cd ../Sipan.Service.Web
npm install
copy .env.example .env
npm run dev
```

`.env`:

```env
VITE_API_URL=http://localhost:5089
```

## Módulos e API

| Tela | Endpoints |
|------|-----------|
| Pessoas | `/api/pessoas` |
| Animais | `/api/animais` |
| Funcionários | `/api/funcionarios` |
| Usuários | `/api/usuarios` |
| APAC estoque | `/api/estoque` |
| APAC campanhas | `/api/campanhas` |
| APAC doações | `/api/doacoes` |
| APAC financeiro | `/api/financeiro` |
| APAC despesas | `/api/despesas` |
| APAC saúde | `/api/saude?animal_id=` |

Cliente: `src/api/client.js` — erros `{ mensagem }`, DELETE → 204.

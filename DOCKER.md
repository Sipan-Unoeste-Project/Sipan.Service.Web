# MySQL no Docker – SIPAN

## Pré-requisito

Instale o [Docker Desktop](https://www.docker.com/products/docker-desktop/) e deixe-o **em execução**.

## Escolha o modo de uso

| Modo | Quem usa | Quando |
|------|----------|--------|
| [Desenvolvimento local](#desenvolvimento-local-opção-1) | Cada dev sobe o próprio Docker | Padrão: dados isolados, sem firewall |
| [Banco compartilhado na rede](#banco-compartilhado-na-rede-opção-2) | Um PC servidor + time na mesma LAN | Mesmos dados para todos (demo, testes integrados) |

---

## Desenvolvimento local (opção 1)

Cada pessoa clona o repositório e roda o Docker na **própria máquina**. Não é necessário compartilhar IP nem abrir portas no firewall.

```bash
docker compose up -d
```

Copie `.env.example` para `.env`:

```env
DB_HOST=localhost
DB_PORT=3307
DB_NAME=sipan
DB_USER=sipan
DB_PASSWORD=sipan_dev_2026
```

Adminer: http://localhost:8080 (servidor `mysql`, usuário `sipan`, banco `sipan`).

---

## Banco compartilhado na rede (opção 2)

Uma máquina fica como **servidor** do MySQL (Docker sempre ligado). Os demais membros do time conectam pelo **IP da rede local** e pela porta **3307**.

> **Atenção:** credenciais abaixo são só para **desenvolvimento**. Use apenas em rede confiável (casa, laboratório). Não exponha essas portas na internet pública.

### Visão geral

```
┌─────────────────┐     Wi‑Fi / LAN      ┌──────────────────────────────┐
│  PC do time     │ ───────────────────► │  PC servidor (Docker)        │
│  DBeaver / API  │   IP:3307 (MySQL)    │  sipan-mysql :3307 → :3306   │
│  Adminer :8080  │   IP:8080 (Adminer)  │  sipan-adminer :8080         │
└─────────────────┘                      └──────────────────────────────┘
```

| Serviço | Porta no servidor | Uso |
|---------|-------------------|-----|
| MySQL   | **3307**          | Apps, DBeaver, Workbench, backend |
| Adminer | **8080**          | Interface web no navegador |

A porta **3307** no Windows evita conflito com MySQL instalado localmente (que costuma usar **3306**).

---

### Parte A — Configurar o PC servidor

Quem vai hospedar o banco para o time.

#### 1. Subir os containers

Na pasta `Sipan.Service.Web`:

```bash
docker compose up -d
```

Aguarde o container ficar **healthy** (~30 s na primeira vez).

```bash
docker compose ps
```

#### 2. Conferir o banco localmente

```bash
docker compose exec mysql mysql -u sipan -psipan_dev_2026 sipan -e "SHOW TABLES;"
```

Deve listar **14 tabelas**.

#### 3. Descobrir o IP na rede local

**Windows** (PowerShell ou CMD):

```powershell
ipconfig
```

Use o **Endereço IPv4** do adaptador ativo (Wi‑Fi ou Ethernet), por exemplo `192.168.1.42`.

Anote esse IP e envie ao time (ex.: em grupo ou README interno).

> O IP pode mudar se o roteador renovar DHCP. Para servidor fixo, configure IP estático no Windows ou reserva de DHCP no roteador.

#### 4. Liberar portas no Firewall do Windows

O time precisa alcançar **3307** (MySQL) e, se quiserem Adminer pelo navegador, **8080**.

**Opção manual**

1. **Configurações** → **Privacidade e segurança** → **Segurança do Windows** → **Firewall e proteção de rede**
2. **Configurações avançadas** → **Regras de entrada** → **Nova regra…**
3. Tipo: **Porta** → TCP → portas específicas: `3307,8080`
4. Permitir conexão → marque **Privado** (rede doméstica/laboratório)
5. Nome sugerido: `SIPAN MySQL Docker`

**Opção PowerShell** (executar como Administrador):

```powershell
New-NetFirewallRule -DisplayName "SIPAN MySQL (3307)" -Direction Inbound -Protocol TCP -LocalPort 3307 -Action Allow -Profile Private
New-NetFirewallRule -DisplayName "SIPAN Adminer (8080)" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow -Profile Private
```

#### 5. Testar se a porta está acessível (no servidor)

```powershell
Test-NetConnection -ComputerName localhost -Port 3307
```

`TcpTestSucceeded : True` indica que o Docker está escutando.

#### 6. Manter o servidor disponível

- Docker Desktop deve estar **aberto** e em execução.
- Após reiniciar o PC, rodar de novo na pasta do projeto:

```bash
docker compose up -d
```

- Evite `docker compose down -v` no servidor compartilhado — isso **apaga todos os dados** do volume.

---

### Parte B — Conectar do PC de cada membro do time

Todos devem estar na **mesma rede** (mesmo Wi‑Fi ou mesma LAN). VPN ou outra rede pode bloquear.

Substitua `192.168.1.42` pelo IP real do servidor.

#### Variáveis de ambiente (`.env` do backend/API)

```env
DB_HOST=192.168.1.42
DB_PORT=3307
DB_NAME=sipan
DB_USER=sipan
DB_PASSWORD=sipan_dev_2026
```

#### DBeaver / MySQL Workbench / HeidiSQL

| Campo    | Valor              |
|----------|--------------------|
| Host     | `192.168.1.42`     |
| Porta    | `3307`             |
| Banco    | `sipan`            |
| Usuário  | `sipan`            |
| Senha    | `sipan_dev_2026`   |

#### Adminer (navegador)

Abra: **http://192.168.1.42:8080**

| Campo    | Valor              |
|----------|--------------------|
| Sistema  | MySQL              |
| Servidor | `mysql`            |
| Usuário  | `sipan`            |
| Senha    | `sipan_dev_2026`   |
| Banco    | `sipan`            |

> No Adminer remoto, o campo **Servidor** continua sendo `mysql` (nome do serviço dentro do Docker no PC servidor), não o IP.

#### Testar conectividade (no PC do time)

**Windows:**

```powershell
Test-NetConnection -ComputerName 192.168.1.42 -Port 3307
```

Se falhar, o problema costuma ser firewall no servidor, IP errado ou redes diferentes.

**Com cliente MySQL instalado:**

```bash
mysql -h 192.168.1.42 -P 3307 -u sipan -p sipan
# Senha: sipan_dev_2026
```

---

### Credenciais (desenvolvimento)

| Uso        | Usuário | Senha            |
|------------|---------|------------------|
| Aplicação  | `sipan` | `sipan_dev_2026` |
| Root       | `root`  | `root_local_dev` |

Não use em produção.

---

### Solução de problemas (opção 2)

| Sintoma | Possível causa | O que fazer |
|---------|----------------|-------------|
| `Connection refused` / timeout | Firewall bloqueando | Revisar regras 3307/8080 no **servidor** |
| Funciona no servidor, não no time | IP errado ou redes diferentes | Confirmar IPv4 com `ipconfig`; mesmo Wi‑Fi |
| IP mudou e parou de conectar | DHCP renovou IP | Atualizar `DB_HOST` / DBeaver com novo IP |
| `Ports are not available` ao subir Docker | MySQL local na 3306 | Já mapeado para **3307** no `docker-compose.yml` |
| Tabelas vazias no servidor | Primeira subida ok | Normal; dados são compartilhados a partir das inserções |
| Perdeu todos os dados | `docker compose down -v` | Recria banco vazio; rodar `schema.sql` de novo se necessário |

---

## Interface web (Adminer) — só no servidor local

Se você está **no próprio PC** que roda o Docker:

http://localhost:8080

| Campo    | Valor              |
|----------|--------------------|
| Sistema  | MySQL              |
| Servidor | `mysql`            |
| Usuário  | `sipan`            |
| Senha    | `sipan_dev_2026`   |
| Banco    | `sipan`            |

---

## Comandos úteis

```bash
# Parar containers
docker compose down

# Parar e APAGAR todos os dados (recria o banco na próxima subida)
docker compose down -v

# Ver logs do MySQL
docker compose logs -f mysql

# Entrar no MySQL pelo terminal (no servidor)
docker compose exec mysql mysql -u sipan -psipan_dev_2026 sipan
```

---

## Checklist rápido — opção 2

**Servidor**

- [ ] `docker compose up -d` e container **healthy**
- [ ] `SHOW TABLES` com 14 tabelas
- [ ] IP anotado (`ipconfig`)
- [ ] Firewall: portas **3307** e **8080** (rede Privada)
- [ ] IP e credenciais repassados ao time

**Time**

- [ ] Mesma rede Wi‑Fi/LAN
- [ ] `.env` ou cliente SQL com `DB_HOST=<IP>` e `DB_PORT=3307`
- [ ] `Test-NetConnection` ou teste no DBeaver OK

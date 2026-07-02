# Guia de Infraestrutura AWS — LoterixSystems (handoff para o Claude)

> **Objetivo deste arquivo:** dar ao Claude (ou a qualquer dev) tudo que ele precisa para
> **entrar na AWS, ler a estrutura existente e criar um sistema novo no mesmo padrão** dos que já existem.
> Levantado ao vivo em 2026-07-01 via AWS CLI (usuário `loterix-deploy`).

---

## 0. Resposta rápida: "o Claude precisa deste doc ou lê só com as credenciais?"

**Ele consegue ler quase tudo ao vivo, só entrando com as credenciais.** Com o usuário IAM
`loterix-deploy` (AWS CLI já configurado na máquina), o Claude faz `describe`/`list` e descobre
clusters ECS, serviços, task definitions, RDS, ALBs, security groups, CloudFront, secrets, etc.
Ver a **seção 8 (comandos de leitura ao vivo)**.

**Mas este doc continua valendo** porque tem coisas que **não estão na AWS**:
- os **repositórios GitHub** e o **pipeline de CI** (build/deploy);
- os **secrets do GitHub Actions** (chaves de deploy, VITE_*);
- as **convenções de nome** e decisões de arquitetura;
- o **fluxo correto** de criar um serviço novo sem quebrar nada.

Resumo: **credenciais = leitura**; **este doc = leitura + como fazer certo + o que está fora da AWS**.

---

## 1. Acesso / credenciais

| Item | Valor |
|---|---|
| Account ID | `833333701392` |
| Region padrão | `us-east-1` |
| IAM user (CI/CD + admin CLI) | `loterix-deploy` (`arn:aws:iam::833333701392:user/loterix-deploy`) |
| AWS CLI | já configurado na máquina do dono (perfil default) |

Confirme o acesso com: `aws sts get-caller-identity`.

---

## 2. Visão geral da arquitetura

- **Tudo backend roda em ECS Fargate** (sem EC2 gerenciado). Cada "sistema" = um **cluster ECS** + 1..N **serviços**.
- Cada grupo de serviços fica atrás de um **ALB** (Application Load Balancer) internet-facing, HTTPS.
- **Banco: 1 RDS MySQL compartilhado** por todos (multi-tenant por schema — ver seção 6).
- **Frontends (React/Vite): S3 + CloudFront** (1 distribuição por site/tenant), deploy por GitHub Actions.
- **Imagens Docker: ECR** (1 repositório por serviço).
- **Segredos: AWS Secrets Manager** (injetados na task def como `secrets`).
- **Deploy: GitHub Actions** por repositório (build → ECR → registra task def / force-new-deployment).
- **DNS: Route 53** (zonas hospedadas na AWS). **TLS: ACM** (certificados no ALB e no CloudFront).

---

## 3. Inventário atual (2026-07-01)

### Rede (VPC)
| Item | Valor |
|---|---|
| VPC | `vpc-0a8454e3b7c6235a0` |
| Subnets públicas | `subnet-0b27204d6d4f871e5` (us-east-1a), `subnet-02c6b9bb14bcb3047` |
| Security Group das tasks Fargate | `sg-082e0a77baacf4871` |
| Security Group do RDS | `sg-06c752e95985ad2f9` (libera 3306 por IP; add/remove IP para acesso pontual) |

### IAM roles usadas nas task defs
- Execution role: `arn:aws:iam::833333701392:role/ecsTaskExecutionRole` (puxa imagem do ECR + lê Secrets Manager + escreve logs)
- Task role: `arn:aws:iam::833333701392:role/ecsTaskRole`

### Clusters ECS e serviços
| Cluster | Serviços |
|---|---|
| `loterix-backend-cluster` | `loterix-backend-service` (2 tasks) |
| `loterix-autojob-cluster` | `autojob-{bichomaster,primebichos,bichoroyale,lotobichos,nubicho,sorteminha}` (1 por tenant) |
| `loterix-pay-cluster` | `pay-{bichomaster,primebichos,bichoroyale,lotobichos,nubicho,sorteminha}` |
| `loterix-crawlers-cluster` | `loterix-crawlers-service` |
| `result-crawlers-cluster` | `result-crawlers-service` |

### ECR (repositórios de imagem)
`loterix-backend`, `loterix-autojob`, `loterias-pay`, `loterix-crawlers`, `result-backend`, `result-crawlers`

### ALBs (internet-facing, HTTP:80 + HTTPS:443)
| ALB | DNS |
|---|---|
| `loterix-backend-alb` | `loterix-backend-alb-671918135.us-east-1.elb.amazonaws.com` (api.bicho.bet / api.bichomaster.com) |
| `loterix-autojob-alb` | `loterix-autojob-alb-1093782985...` (autojob.<tenant>.com) |
| `loterix-pay-alb` | `loterix-pay-alb-1011120858...` (pay.<tenant>.com) |
- Backend target group: `loterix-backend-tg`, container port **3000**.
- WAF: `loterix-backend-waf` (WAFv2 REGIONAL) associado ao `loterix-backend-alb` (managed rules + rate-limit + IP set `loterix-blocked-ips`).

### RDS
| Item | Valor |
|---|---|
| Identificador | `bichomaster-db` |
| Engine / classe | MySQL / `db.t3.small` |
| Endpoint | `bichomaster-db.csx6yysay70e.us-east-1.rds.amazonaws.com:3306` |
| Público | sim (acesso liberado por IP no SG `sg-06c752e95985ad2f9`) |
| Databases (tenants) | `bichomaster, bichoroyale, lotobichos, nubicho, primebichos, sorteminha` (+ `loterixsistems`, `resultados`) |
| Credenciais | Secrets Manager `loterix/db` (host/name) e `loterix/db-app` (user/password) |

### Secrets Manager
`loterix/db`, `loterix/db-app`, `loterix/jwt`, `loterix/autojob-jwt`, `loterix/internal`,
`loterix/firebase`, `loterix/pay-confirm-secrets`, `loterix/result-backend-jwt`
> Referência na task def: `valueFrom = arn:...:secret:<nome>-<sufixo>:<CHAVE>::` (chave = campo do JSON do secret).

### CloudFront (frontends)
Sites de cliente: `bichomaster.com`, `bichoroyale.com`, `lotobichos.com`, `nubicho.com`, `primebichos.com`, `sorteminha.com`, `bicho.bet` (cada um com distribuição própria + `www`).
Dashboards admin: `admin.<tenant>.com` (distribuição própria por tenant).
Buckets S3: nome = o domínio (ex.: `primebichos.com`, `admin.bichomaster.com`).

---

## 4. Padrão de task definition (o "molde" de um serviço Fargate)

Do `loterix-backend` (use como base para um serviço backend novo):
- Launch type: **FARGATE**, network mode **awsvpc**, `assignPublicIp: ENABLED`.
- CPU/Mem: `256`/`512` (ajuste conforme a carga).
- Execution role `ecsTaskExecutionRole`, task role `ecsTaskRole`.
- Log driver `awslogs`, log group `/ecs/<nome-do-app>` (region us-east-1).
- Porta do container: 3000 (NestJS). Ajuste conforme o app.
- `secrets` (do Secrets Manager) em vez de `environment` para valores sensíveis:
  `DB_HOST`, `DB_NAME` ← `loterix/db`; `DB_USERNAME`, `DB_PASSWORD` ← `loterix/db-app`;
  `JWT_SECRET` ← `loterix/jwt`; `INTERNAL_SECRET` ← `loterix/internal`; etc.
- `environment` para não-sensíveis (ex.: `PORT`, `DB_DATABASE` por tenant, flags de modo).

---

## 5. Padrão de deploy (GitHub Actions)

Cada repositório tem `.github/workflows/*.yml` que dispara em `push` na `main` (+ `workflow_dispatch`).

**Serviços backend (Node/Go) — dois estilos usados:**
1. **loterix-backend**: `describe-task-definition` → registra **nova revisão** trocando só a imagem (`:sha`) → `update-service --task-definition <novo-arn> --force-new-deployment`. (Preserva env/secrets da revisão anterior.)
2. **loterix-autojob / loterias-pay**: `docker build` → push `:sha` e `:latest` no ECR → `update-service --force-new-deployment` em **todos** os serviços `*-<tenant>` do cluster (descobre dinamicamente ou lista fixa).

**Frontends (Vite): matrix por tenant** → `VITE_THEME`/`VITE_DATABASE_NAME`/`VITE_API_URL` no env do build → `npm run build` (`dist-<tenant>`) → `aws s3 sync dist-<tenant> s3://<bucket> --delete` → `aws cloudfront create-invalidation`.

**Secrets do GitHub Actions** (por repo): `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (do user `loterix-deploy`), e VITE_* quando aplicável (ex.: `TURNSTILE_SITE_KEY`).

Comandos manuais de deploy (quando precisar forçar): ver `memory/reference_deploy.md`.

---

## 6. Multi-tenancy (importante para o sistema novo)

- **RDS único, um schema (database) por tenant.** Todos os pools usam o **mesmo host/user/senha** (Secrets Manager `loterix/db` + `loterix/db-app`), só muda o `database`.
- O **backend** escolhe o tenant por request via header **`x-database-name`** (com allowlist de tenants válidos no `DatabaseNameProvider`).
- O **autojob** e o **pay** são **deployados 1 por tenant** (env `DB_DATABASE=<tenant>` fixo por serviço) — não usam header.
- Se o sistema novo for **por tenant**: crie 1 serviço ECS por tenant (env `DB_DATABASE`) OU 1 serviço multi-tenant que leia o header (allowlist!).

---

## 7. Como criar um SISTEMA NOVO no padrão (passo a passo)

> Cenário do dono: **banco e backend já existem**; o novo sistema deve reusar o RDS e seguir o padrão.

1. **Repositório GitHub** + Dockerfile do app. Adicionar `.github/workflows/deploy.yml` (copiar de um repo existente, ex. `loterix_autojob`).
2. **ECR**: `aws ecr create-repository --repository-name <novo-app> --region us-east-1`.
3. **CloudWatch log group** (ou deixar o awslogs criar): `/ecs/<novo-app>`.
4. **Secrets**: reusar `loterix/db` + `loterix/db-app` (mesmo RDS). Criar secret novo só se o app tiver segredos próprios.
5. **Task definition** (Fargate, awsvpc, roles `ecsTaskExecutionRole`/`ecsTaskRole`, log group, secrets, porta). Base: seção 4.
6. **ALB**: reusar um ALB existente (novo **target group** + **listener rule** por host/path) **ou** criar `<novo-app>-alb`. TLS via **ACM** (certificado do domínio no ALB).
7. **Security group**: pode reusar `sg-082e0a77baacf4871` (tasks) — libera saída pro RDS/ALB. Se novo, garantir egress e ingress do ALB.
8. **ECS service** (Fargate): cluster (novo ou existente), subnets `subnet-0b27204d6d4f871e5` + `subnet-02c6b9bb14bcb3047`, SG `sg-082e0a77baacf4871`, `assignPublicIp ENABLED`, ligar ao target group.
9. **Route 53**: registro (A/alias) do domínio → ALB (backend) ou CloudFront (frontend).
10. **Banco**: se precisar de schema novo, criar o database no RDS e rodar as migrations (padrão: scripts `.mjs` em `loterix_backend/scripts`, que leem o `.env` e conectam via mysql2). **Rodar migration em TODOS os bancos relevantes** (lição aprendida).
11. **CI**: configurar os secrets do repo (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) e dar push na `main`.

**Frontend novo:** criar bucket S3 (= domínio) + distribuição CloudFront (origin S3, SPA fallback p/ index.html), ACM cert (us-east-1 para CloudFront), Route 53, e a matrix no workflow do frontend.

---

## 8. Comandos de LEITURA ao vivo (descobrir tudo com as credenciais)

```bash
aws sts get-caller-identity
# ECS
aws ecs list-clusters --region us-east-1
aws ecs list-services --cluster <cluster> --region us-east-1
aws ecs describe-services --cluster <cluster> --services <svc> --region us-east-1
aws ecs describe-task-definition --task-definition <family[:rev]> --region us-east-1
# ECR / RDS / ALB
aws ecr describe-repositories --region us-east-1
aws rds describe-db-instances --region us-east-1
aws elbv2 describe-load-balancers --region us-east-1
aws elbv2 describe-target-groups --region us-east-1
aws elbv2 describe-listeners --load-balancer-arn <arn> --region us-east-1
# Secrets (nomes; valores exigem get-secret-value)
aws secretsmanager list-secrets --region us-east-1
# CloudFront / Route53 / VPC
aws cloudfront list-distributions
aws route53 list-hosted-zones
aws ec2 describe-vpcs --region us-east-1
aws ec2 describe-subnets --region us-east-1
aws ec2 describe-security-groups --group-ids <sg> --region us-east-1
# Logs
aws logs describe-log-groups --region us-east-1
aws logs filter-log-events --log-group-name /ecs/<app> --start-time <ms> --filter-pattern '...'
```

Acesso ao **banco** (pontual, para migrations/leitura): liberar o IP atual no SG do RDS,
conectar via mysql2 (`.env` do `loterix_backend`), e **remover o IP ao terminar**:
```bash
aws ec2 authorize-security-group-ingress --group-id sg-06c752e95985ad2f9 \
  --ip-permissions 'IpProtocol=tcp,FromPort=3306,ToPort=3306,IpRanges=[{CidrIp=<IP>/32,Description="tmp"}]' --region us-east-1
# ... trabalho ...
aws ec2 revoke-security-group-ingress --group-id sg-06c752e95985ad2f9 \
  --ip-permissions 'IpProtocol=tcp,FromPort=3306,ToPort=3306,IpRanges=[{CidrIp=<IP>/32}]' --region us-east-1
```

---

## 9. Convenções / lições

- Nomes: `loterix-<app>-cluster`, `<app>-<tenant>` para serviços por tenant, ECR = nome do app, log group `/ecs/<app>`.
- Sempre **preservar env/secrets** ao registrar nova revisão de task def (o CI do backend faz isso lendo a revisão atual).
- Segredos sempre em **Secrets Manager**, nunca hardcoded/plaintext na task def quando der.
- Migrations: rodar em **todos** os bancos (SHOW DATABASES), não só nos "conhecidos".
- Remover regra de IP do SG do RDS depois de usar.

## 10. Repositórios GitHub (fora da AWS)
Org **LoterixSystems**: `loterix_backend`, `loterix_frontend`, `loterix_dashboard`, `loterix_pay`, `loterix_autojob`, `loterix_sql`.
Org **cometadigitalag** (results): `result_backend`, `result_dashboard`, `result_frontend`, `result_crawlers`.
(Alguns remotes migraram; `loterix_autojob` também responde por `cometadigitalag`.)

---

## 11. O que dizer ao Claude para criar o sistema novo (checklist de perguntas ao dono)
1. É **backend** (ECS/ALB) ou **frontend** (S3/CloudFront) — ou os dois?
2. Nome do sistema / domínio(s)?
3. É **por tenant** (um serviço por white-label) ou **único**?
4. Precisa de **banco novo** (schema no RDS) ou usa os tenants existentes?
5. Stack/linguagem (define o Dockerfile e a porta)?
6. Segredos próprios (criar em Secrets Manager) ou só os do banco?
7. Domínio já no Route 53? Precisa de certificado ACM?

# Инфраструктура

Домен `timurtukfatullin.uz` (регистратор — aHost), DNS — Cloudflare, сайт —
GitHub Pages. Всё, кроме разовых шагов ниже, описано здесь в Terraform:

- `dns.tf` — зона в Cloudflare, A/AAAA-записи домена на GitHub Pages, `www` →
  CNAME, TXT для подтверждения домена в GitHub (необязательно);
- `pages.tf` — GitHub Pages репозитория: сборка через Actions, свой домен, HTTPS;
- `main.tf` — провайдеры и состояние в Cloudflare R2 (бакет `resume-tfstate`).

Изменения проходят через PR: workflow `Infra` показывает `terraform plan`, после
слияния в `main` делает `terraform apply`.

## Разовые шаги

1. **Домен активен в реестре `.uz`.** Проверка: `dig +short timurtukfatullin.uz NS`
   не должна отвечать `NXDOMAIN`.
2. **Токены** (их создают только в интерфейсах, по одному разу):
   - **Cloudflare API token** (My Profile → API Tokens): Account → R2 Storage:
     Edit, Zone → Zone: Edit, Zone → DNS: Edit; ресурсы — ваш аккаунт и все его
     зоны. Нужен ещё **Account ID** (виден в URL панели Cloudflare).
   - **R2 S3-ключи** (R2 → Manage API tokens): Object Read & Write на бакет
     `resume-tfstate`. Для R2 Cloudflare может попросить привязать карту, хотя
     этот объём бесплатный.
   - **GitHub fine-grained token** (Settings → Developer settings): только
     репозиторий `Freyzan2006/resume`, права Administration и Pages — Read and write.
3. **Бакет и секреты CI** — скриптом (нужны `gh auth login` и `curl`):

   ```sh
   export CLOUDFLARE_ACCOUNT_ID=… CLOUDFLARE_API_TOKEN=… TF_GITHUB_TOKEN=…
   export R2_ACCESS_KEY_ID=… R2_SECRET_ACCESS_KEY=…
   ./infra/bootstrap.sh
   ```

4. **Первый `apply`** — слить `infra/` в `main` (или `gh workflow run infra.yml`).
   Создаются зона и DNS-записи, Pages только импортируется — сайт на github.io
   продолжает работать. В выводе — `name_servers`.
5. **NS-серверы у aHost** — в панели домена заменить NS на два сервера из
   `name_servers`. Это единственная настройка у регистратора. Когда Cloudflare
   увидит их, `zone_status` станет `active`, а `dig +short timurtukfatullin.uz`
   покажет адреса GitHub.
6. **Домен в Pages** — `serve_from_domain = true` в `variables.tf` через PR.
   Включать только когда домен уже отвечает адресами GitHub: с этого момента
   github.io перенаправляет на домен. Вместе с этим — `url:
   https://timurtukfatullin.uz/` в `assets/config.yaml`.
7. **HTTPS** — когда GitHub выпустит сертификат (от минут до суток), поменять
   `enforce_https` на `true` в `variables.tf` через PR.

## Локально

```sh
cd infra
export TF_VAR_cloudflare_account_id=$CLOUDFLARE_ACCOUNT_ID
export AWS_ENDPOINT_URL_S3=https://$CLOUDFLARE_ACCOUNT_ID.r2.cloudflarestorage.com
export AWS_ACCESS_KEY_ID=$R2_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY=$R2_SECRET_ACCESS_KEY
export CLOUDFLARE_API_TOKEN=… GITHUB_TOKEN=$TF_GITHUB_TOKEN
terraform init && terraform plan
```

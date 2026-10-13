# Инфраструктура

Свой домен для сайта: DNS — Cloudflare, сайт — GitHub Pages. Всё, кроме разовых
шагов ниже, описано в Terraform; под себя меняется только `terraform.tfvars`.

- `terraform.tfvars` — домен, GitHub-аккаунт и репозиторий, этапы подключения
  (`serve_from_domain`, `enforce_https`);
- `dns.tf` — зона в Cloudflare, A/AAAA-записи домена на GitHub Pages, `www` →
  CNAME, TXT для подтверждения домена в GitHub (необязательно);
- `pages.tf` + `pages.sh` — GitHub Pages: включает их, если ещё нет, сборка
  через Actions, свой домен, HTTPS. Не через ресурс провайдера GitHub: в версии
  6.13.0 любое изменение Pages, кроме домена, удаляет домен (отправляет
  `"cname": null`), поэтому настройки ставит скрипт через API, каждый раз
  вместе с доменом;
- `main.tf` — провайдеры и состояние в Cloudflare R2 (бакет `resume-tfstate`
  в вашем аккаунте Cloudflare);
- `bootstrap.sh` — разово: бакет для состояния и секреты CI.

Изменения проходят через PR: workflow `Infra` (`.github/workflows/infra.yml`)
показывает `terraform plan`, после слияния в `main` делает `terraform apply`.

## Подключение домена

1. **Домен активен у регистратора.** Проверка: `dig +short <домен> NS` не
   отвечает `NXDOMAIN` (для `.uz` после покупки это может занять до суток).
2. **`terraform.tfvars`** — свои `domain`, `github_owner`, `repository`;
   `serve_from_domain` и `enforce_https` — `false`.
3. **Токены** (их создают только в интерфейсах, по одному разу; в чаты и
   репозиторий не попадают — храните в файле вне репозитория, например
   `~/.config/resume-infra.env` с правами `600`):
   - **Cloudflare API token** (My Profile → API Tokens → Custom): Account →
     Workers R2 Storage: Edit, Zone → Zone: Edit, Zone → DNS: Edit; ресурсы —
     ваш аккаунт и все его зоны. И **Account ID** (виден в URL панели).
   - **R2 S3-ключи** (R2 → Manage API tokens): Object Read & Write на все
     бакеты аккаунта. R2 нужно один раз включить; Cloudflare может попросить
     привязать карту, хотя этот объём бесплатный.
   - **GitHub fine-grained token** (Settings → Developer settings): только этот
     репозиторий, права Administration и Pages — Read and write.
4. **Бакет и секреты CI** (нужны `gh auth login` и `curl`):

   ```sh
   # CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, R2_ACCESS_KEY_ID,
   # R2_SECRET_ACCESS_KEY, TF_GITHUB_TOKEN
   set -a; . ~/.config/resume-infra.env; set +a
   ./infra/bootstrap.sh
   ```

5. **Первый `apply`** — слить изменения `infra/` в `main` (или
   `gh workflow run infra.yml`). Создаются зона и DNS-записи; сайт на github.io
   продолжает работать. В выводе workflow — `name_servers`.
6. **NS у регистратора** — заменить NS домена на два сервера из
   `name_servers`, остальные убрать. Это единственная настройка у регистратора.
   Готово, когда `dig +short <домен>` отвечает адресами GitHub
   (`185.199.108–111.153`).
7. **Домен в Pages** — PR: `serve_from_domain = true` в `terraform.tfvars` и
   `url: https://<домен>/` в `assets/config.yaml`. Не раньше шага 6: с этого
   момента github.io перенаправляет на домен.
8. **HTTPS** — когда сайт открывается по `https://<домен>/` (GitHub выпускает
   сертификат от минут до суток), PR: `enforce_https = true`. После этого
   `http://` перенаправляет на `https://`.

## Обслуживание

- **GitHub-токен истёк** — workflow `Infra` падает на авторизации (сайт при
  этом работает). Перевыпустить токен и `gh secret set TF_GITHUB_TOKEN`.
- **Посмотреть план локально:**

  ```sh
  set -a; . ~/.config/resume-infra.env; set +a
  cd infra
  export TF_VAR_cloudflare_account_id=$CLOUDFLARE_ACCOUNT_ID GITHUB_TOKEN=$TF_GITHUB_TOKEN
  export AWS_ENDPOINT_URL_S3=https://$CLOUDFLARE_ACCOUNT_ID.r2.cloudflarestorage.com
  export AWS_ACCESS_KEY_ID=$R2_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY=$R2_SECRET_ACCESS_KEY
  terraform init && terraform plan
  ```

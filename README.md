# Resume

Сайт-резюме и PDF из данных в `assets/`. Чтобы сделать резюме под себя,
достаточно поменять только эту папку.

Полный пример лежит в `examples/assets/` (резюме-заглушка: два профиля, три
языка, все разделы). Начать проще всего с него: скопировать в `assets/` и
заменить данные. Посмотреть пример вживую: `bun run dev:example`.

## Контент

```
assets/
  config.yaml                 настройки: profile, url, lang, sections, formats, labels
  photo.jpg                   фото (путь задаётся в резюме)
  frontend/                   профиль — резюме под одну специальность
    resume.ru.yaml            по файлу на язык
    resume.en.yaml
  devops/
    resume.ru.yaml
```

- **Профили.** Каждая папка в `assets/` — отдельное резюме под специальность.
  Собирается одна, та, что указана в `profile` в `config.yaml` (если папка одна,
  `profile` можно не писать). Остальные лежат готовыми — переключение одной строкой.
- **Языки.** `resume.<язык>.yaml` — версия на этом языке. Версия на основном
  языке (`lang` в `config.yaml`, по умолчанию `ru`) обязательна. На сайте
  появляется переключатель; основной язык живёт в корне сайта, остальные — в
  папках (`/en/`, `/uz/`). PDF и JSON собираются для
  каждого языка. Подписи разделов встроены для `ru` и `en`, свои задаются в
  `labels` по языкам.
- **Формат** — [JSON Resume](https://jsonresume.org/schema) в YAML. Готовый
  `resume.json` можно положить как `resume.<язык>.json`: YAML 1.2 читает JSON как есть.
- **Фото** — `basics.image`: URL или путь относительно файла резюме
  (`image: ../photo.jpg`).
- **Стаж** считается автоматически из дат `work`: у каждой работы и общий в
  заголовке раздела. Считается как на hh.ru: от месяца начала до месяца окончания, не включая его;
  пересекающиеся периоды не суммируются дважды.
- Поля `summary`, `description` и `highlights` поддерживают markdown.
- Даты: `YYYY`, `YYYY-MM` или `YYYY-MM-DD`; пустой `endDate` — «по настоящее время».
- Сверх JSON Resume: `work[].keywords` — стек технологий.
- Разделы `volunteer`, `awards`, `publications`, `interests`, `references`
  принимаются, но пока не отображаются (сборка предупредит).

Данные проверяются схемами из `src/core/` (`resume-schema.ts`,
`config-schema.ts`): при ошибке сборка падает с указанием файла и поля. Из них
же генерируются `schemas/*.schema.json` — с расширением
[YAML](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)
VS Code подсказывает поля и подчёркивает ошибки прямо в редакторе.

## SEO

У каждого языка своя страница: основной в корне, остальные в `/en/`, `/uz/`.
Переключатель языка — обычные ссылки между ними.

- **Prerender.** `bun run build` открывает каждую страницу в Chromium и
  записывает готовую разметку резюме в её `index.html`: поисковики и превью
  ссылок видят текст без JS, а на медленном телефоне резюме видно сразу, до
  загрузки скриптов.
- **`<head>` каждой страницы** на её языке: `description`, Open Graph и Twitter
  Card из `basics.name`, `label`, `summary` (markdown → текст до 160 символов);
  JSON-LD `schema.org/Person` — должность, текущая работа, образование, навыки,
  языки, ссылки из `profiles`. Email и телефон туда не попадают.
- **`url` в `config.yaml`** (адрес сайта) добавляет `canonical` (у каждой
  страницы — на саму себя), `hreflang`, `og:url`, `sitemap.xml` и картинки
  превью `og.<язык>.png` 1200×630: их рисует Chromium на CSS сайта — фото, имя,
  должность, город, стаж, первые навыки и адрес сайта. Без `url` `og:image`
  берётся из `basics.image`, только если это URL.
- `robots.txt`.

Старые ссылки вида `?lang=en` перенаправляются на `/en/`.

## Команды

```sh
bun run dev            # сайт с live-reload при правке assets/
bun run build          # dist/ + файлы для скачивания, картинки превью, prerender
bun run dev:example    # то же для примера из examples/assets
bun run build:example
bun run build:site     # только сайт: без файлов для скачивания и prerender
bun run export         # шаги после сборки для уже собранного dist/
bun run test           # vitest
bun run schema         # перегенерировать schemas/ после правки схем
bun run cn:tables      # таблицы для cn (сами запускаются перед dev, typecheck и build)
bun run check          # biome: формат, импорты, классы Tailwind, линт (с исправлением)
bun run ci             # biome ci + typecheck + knip + тесты
```

Любую другую папку с контентом можно собрать так: `RESUME_ASSETS=путь bun run build`.

Git-хуки (lefthook, ставятся при `bun install`): перед коммитом — biome по
изменённым файлам, typecheck и knip; перед пушем — `bun run ci`. В GitHub те же
проверки идут стадией `check` перед сборкой и деплоем.

## Форматы скачивания

`formats` в `config.yaml` (по умолчанию `[pdf]`) задаёт, какие файлы собираются
в `dist/` и какие кнопки появляются на сайте:

| Формат | Файл                 | Что это                                                        |
| ------ | -------------------- | -------------------------------------------------------------- |
| `pdf`  | `resume.<язык>.pdf`  | Сайт, распечатанный headless Chromium (стили `print:`)         |
| `json` | `resume.<язык>.json` | JSON Resume: подходит для тем jsonresume.org и других сервисов |
| `docx` | `resume.<язык>.docx` | Word: настоящие заголовки, списки и ссылки — удобно править и отправлять в ATS |
| `md`   | `resume.<язык>.md`   | Markdown: те же разделы и подписи, что на сайте; markdown из YAML как есть |

Кнопка «Скачать PDF» скачивает первый формат из `formats` в один клик. Рядом —
меню с остальными форматами и «Предпросмотром»: окно с вкладкой на каждый
формат. JSON и Markdown показаны с подсветкой ровно как скачаются и
копируются кнопкой; Word нарисован docx-preview;
PDF нарисован pdf.js (загружается только при открытии превью) и открывается в
новой вкладке. Фокус в окне стоит на «Скачать», так что Enter скачивает файл.
Превью и дополнительные кнопки форматов — реестр `previews` в
`src/web/features/download/previews.ts`.

PDF ищет браузер так: `$CHROMIUM_PATH` → системный Chromium/Chrome →
`bunx playwright install chromium`.

Новый формат: добавить его в `src/core/formats.ts`, написать экспортёр в
`src/build/exporters/` (тип `Exporter` из `types.ts`) и зарегистрировать в
`src/build/exporters/index.ts` — TypeScript не даст забыть последний шаг. Затем
`bun run schema`, чтобы редактор узнал новое значение `formats`.

## Архитектура

```
assets/              контент — единственное, что меняется в форке
examples/assets/     пример контента; на нём же работают тесты
schemas/             JSON Schema для редактора (генерируется: bun run schema)
src/
  core/              домен: схемы, форматы, подписи, даты. Чистый TypeScript
    seo/             мета-теги, JSON-LD, robots.txt, sitemap.xml
  build/             Node: загрузка assets/, Vite-плагин, экспортёры, CLI
    og-image.ts      картинки превью og.<язык>.png
    prerender.ts     готовая разметка страниц в index.html
    exporters/       по экспортёру на формат скачивания
    cli/             export.ts, schema.ts
  web/               React-приложение
    app/             точка входа, оболочка страницы, стили
    sections/        по компоненту на раздел резюме + реестр index.ts
    features/        download, language, theme (состояние на reatom)
    ui/              компоненты shadcn/ui и typography.tsx (роли текста)
    lib/utils.ts     cn, знающий роли текста
tests/               vitest, повторяет структуру src/; fixtures/ — общие данные
```

Зависимости идут только так: `build → core` и `web → core`. Из схем
(`resume-schema`, `config-schema`, …) `web` берёт только типы — zod и unified
не попадают в браузер. Данные в приложение приходят готовыми через виртуальный
модуль `virtual:resume`, который собирает `build/vite-plugin.ts`.

Границы проверяются автоматически:

- у каждого слоя своя tsconfig: в `core` нет ни DOM, ни Node, в `build` нет
  DOM, в `web` нет Node;
- biome (`noRestrictedImports` в `biome.jsonc`) запрещает импорты против
  направления слоёв и зависимости сборки в `web`; типы схем `web` берёт из
  `@core/types`.

Алиасы `@core`, `@web`, `@build`, `@tests` используются в `web` и `tests` —
их разрешают Vite и vitest. `core` и `build` исполняет node напрямую (CLI и
`vite.config.ts`), он алиасов не знает, поэтому там импорты относительные.

Типографика задаётся ролями, а не размерами: `display`, `lead`, `heading`,
`title`, `copy`, `annotation`, `label` — компонент `<Text variant>` из
`src/web/ui/typography.tsx`. Размеры, интерлиньяж и насыщенность — токены
`--text-<роль>` в `src/web/app/index.css`, с отдельной шкалой для печати
(`@media print`). Основной текст набран Inter, имя, заголовки и аннотации —
JetBrains Mono.

Новый раздел резюме: имя в `sectionNames` (`src/core/config-schema.ts`),
подписи в `src/core/labels.ts`, компонент в `src/web/sections/` и запись в
реестре `src/web/sections/index.ts`.

## Деплой от А до Я

Сайт публикуется на GitHub Pages из GitHub Actions. Свой домен — по желанию,
отдельным этапом.

### 1. Что нужно

- аккаунт GitHub (для бесплатного Pages репозиторий должен быть публичным);
- [Bun](https://bun.sh) 1.2+ и Node.js 24 — экспорт файлов запускается в Node;
- Chromium или Chrome — для PDF, превью и prerender (или
  `bunx playwright install chromium`);
- [`gh`](https://cli.github.com) с `gh auth login`;
- для своего домена ещё Terraform 1.11+, аккаунт Cloudflare и купленный домен.

### 2. Репозиторий и свои данные

```sh
gh repo fork Freyzan2006/resume --clone --fork-name resume
cd resume
bun install
rm -r assets && cp -r examples/assets assets
sed -i '1s|\.\./||' assets/config.yaml assets/*/*.yaml   # пути к схемам на уровень выше
```

Дальше — своё резюме в `assets/<профиль>/resume.<язык>.yaml` и настройки в
`assets/config.yaml` (см. «Контент»). Ненужные профили, языки и фото удалите.
`url` пока поставьте адрес, на котором сайт будет на GitHub Pages:
`https://<аккаунт>.github.io/<репозиторий>/` (или `https://<аккаунт>.github.io/`
для репозитория `<аккаунт>.github.io`).

Проверка локально:

```sh
bun run dev     # сайт с live-reload
bun run build   # всё, что уйдёт на сайт: dist/ с PDF, Word, JSON, Markdown
bun run ci      # те же проверки, что в GitHub
```

### 3. Первый деплой на github.io

1. Включить Pages с публикацией из Actions (один раз):

   ```sh
   gh api -X POST repos/<аккаунт>/<репозиторий>/pages -f build_type=workflow
   ```

2. `git push` в `main`. Workflow `CI` (`.github/workflows/ci.yml`): проверки →
   сборка со всеми файлами для скачивания → публикация `dist/` на Pages.
3. Сайт открывается по адресу из `url`. Проверить: страницы всех языков,
   скачивание и превью файлов, переключение темы.

Дальше любое изменение в `assets/` и `git push` — новый деплой.

### 4. Свой домен

Домен, DNS в Cloudflare и настройки Pages описаны в Terraform в `infra/`,
состояние лежит в Cloudflare R2, изменения применяет workflow `Infra` после
слияния в `main`. Коротко:

1. свои домен, аккаунт и репозиторий в `infra/terraform.tfvars`;
2. токены Cloudflare и GitHub, `./infra/bootstrap.sh` — бакет и секреты CI;
3. push → зона и DNS-записи в Cloudflare, в выводе — NS-серверы;
4. эти NS — у регистратора домена;
5. когда домен отвечает адресами GitHub: `serve_from_domain = true` и
   `url: https://<домен>/` в `assets/config.yaml`;
6. когда GitHub выпустит сертификат: `enforce_https = true`.

Подробно, с правами токенов и проверками на каждом шаге, — в `infra/README.md`.

# Resume

Сайт-резюме и PDF из данных в `assets/`. Чтобы сделать резюме под себя,
достаточно поменять только эту папку.

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
  заголовке раздела. Пересекающиеся периоды не суммируются дважды.
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
bun run dev         # сайт с live-reload при правке assets/
bun run build       # dist/ + файлы для скачивания, картинки превью, prerender
bun run build:site  # только сайт: без файлов для скачивания и prerender
bun run export      # шаги после сборки для уже собранного dist/
bun run test        # vitest
bun run schema      # перегенерировать schemas/ после правки схем
bun run check       # biome: формат, импорты, классы Tailwind, линт (с исправлением)
bun run ci          # biome ci + typecheck + knip + тесты
```

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

PDF ищет браузер так: `$CHROMIUM_PATH` → системный Chromium/Chrome →
`bunx playwright install chromium`.

Новый формат: добавить его в `src/core/formats.ts`, написать экспортёр в
`src/build/exporters/` (тип `Exporter` из `types.ts`) и зарегистрировать в
`src/build/exporters/index.ts` — TypeScript не даст забыть последний шаг. Затем
`bun run schema`, чтобы редактор узнал новое значение `formats`.

## Архитектура

```
assets/              контент — единственное, что меняется в форке
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
  `@/core/types`.

Типографика задаётся ролями, а не размерами: `display`, `lead`, `heading`,
`title`, `copy`, `annotation`, `label` — компонент `<Text variant>` из
`src/web/ui/typography.tsx`. Размеры, интерлиньяж и насыщенность — токены
`--text-<роль>` в `src/web/app/index.css`, с отдельной шкалой для печати
(`@media print`). Основной текст набран Inter, имя, заголовки и аннотации —
JetBrains Mono.

Новый раздел резюме: имя в `sectionNames` (`src/core/config-schema.ts`),
подписи в `src/core/labels.ts`, компонент в `src/web/sections/` и запись в
реестре `src/web/sections/index.ts`.

## Деплой

`.github/workflows/deploy.yml` на push в `main` прогоняет lint, тесты, сборку с
PDF и публикует `dist/` на GitHub Pages (Settings → Pages → Source: GitHub Actions).

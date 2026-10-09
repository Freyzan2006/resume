# Resume

Сайт-резюме и PDF, собранные из markdown-файлов в `assets/`.

## Контент

Каждый раздел — отдельный обязательный файл. Структура проверяется схемами в
`src/resume/schema.ts`: при ошибке сборка падает с указанием файла и поля.

| Файл           | Содержимое                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------- |
| `contact.md`   | `name`, `title`, `location?`, `email?`, `phone?`, `links[]`                                     |
| `summary.md`   | `title` + текст (markdown) в теле файла                                                         |
| `jobs.md`      | `title`, `items[]`: `company`, `position`, `start`, `end`, `stack[]`, `description?` (markdown) |
| `education.md` | `title`, `items[]`: `institution`, `degree`, `field?`, `start`, `end`, `description?`           |
| `skills.md`    | `title`, `groups[]`: `name`, `items[]`                                                          |

Даты — `YYYY-MM`, для текущего места `end: present`. Кроме `summary.md`, всё
описывается во frontmatter.

## Команды

```sh
bun run dev         # сайт с live-reload при правке assets/*.md
bun run build       # dist/ + dist/resume.pdf
bun run build:site  # только сайт, без PDF
bun run pdf         # только PDF из уже собранного dist/
bun run test        # vitest
```

PDF печатает headless Chromium через Playwright. Браузер ищется так:
`$CHROMIUM_PATH` → системный Chromium/Chrome → `bunx playwright install chromium`.

## Деплой

`.github/workflows/deploy.yml` на push в `main` прогоняет lint, тесты, сборку с
PDF и публикует `dist/` на GitHub Pages (Settings → Pages → Source: GitHub Actions).

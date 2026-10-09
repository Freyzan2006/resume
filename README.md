# Resume

Сайт-резюме и PDF из данных в `assets/`. Чтобы сделать резюме под себя,
достаточно поменять только эту папку.

## Контент

| Файл                 | Содержимое                                                            |
| -------------------- | --------------------------------------------------------------------- |
| `assets/resume.yaml` | Резюме в формате [JSON Resume](https://jsonresume.org/schema), в YAML |
| `assets/config.yaml` | Необязательные настройки: `lang`, `sections`, `formats`, `labels`     |

- Можно положить готовый `resume.json` из JSON Resume вместо `resume.yaml` —
  YAML 1.2 читает JSON как есть.
- Поля `summary`, `description` и `highlights` поддерживают markdown.
- Даты: `YYYY`, `YYYY-MM` или `YYYY-MM-DD`; пустой `endDate` — «по настоящее время».
- Сверх JSON Resume: `work[].keywords` — стек технологий.
- Разделы `volunteer`, `awards`, `certificates`, `publications`, `interests`,
  `references` принимаются, но пока не отображаются (сборка предупредит).

Данные проверяются схемами из `src/core/` (`resume-schema.ts`, `config-schema.ts`): при ошибке сборка падает
с указанием файла и поля. Из них же генерируются `schemas/*.schema.json` — с
расширением [YAML](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)
VS Code подсказывает поля и подчёркивает ошибки прямо в редакторе.

## Команды

```sh
bun run dev         # сайт с live-reload при правке assets/
bun run build       # dist/ + файлы для скачивания (resume.pdf, resume.json…)
bun run build:site  # только сайт, без файлов для скачивания
bun run export      # только файлы для скачивания из уже собранного dist/
bun run test        # vitest
bun run schema      # перегенерировать schemas/ после правки схем
```

## Форматы скачивания

`formats` в `config.yaml` (по умолчанию `[pdf]`) задаёт, какие файлы собираются
в `dist/` и какие кнопки появляются на сайте:

| Формат | Файл          | Что это                                                        |
| ------ | ------------- | -------------------------------------------------------------- |
| `pdf`  | `resume.pdf`  | Сайт, распечатанный headless Chromium (стили `print:`)         |
| `json` | `resume.json` | JSON Resume: подходит для тем jsonresume.org и других сервисов |

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
  build/             Node: загрузка assets/, Vite-плагин, экспортёры, CLI
    exporters/       по экспортёру на формат скачивания
    cli/             export.ts, schema.ts
  web/               React-приложение
    app/             точка входа, оболочка страницы, стили
    sections/        по компоненту на раздел резюме + реестр index.ts
    features/        download (меню скачивания), theme (тема на reatom)
    ui/              компоненты shadcn/ui
```

Зависимости идут только так: `build → core` и `web → core`. Из схем
(`resume-schema`, `config-schema`, …) `web` берёт только типы — zod и unified
не попадают в браузер. Данные в приложение приходят готовыми через виртуальный
модуль `virtual:resume`, который собирает `build/vite-plugin.ts`.

Границы проверяются автоматически:

- у каждого слоя своя tsconfig: в `core` нет ни DOM, ни Node, в `build` нет
  DOM, в `web` нет Node;
- `bun run lint` (`no-restricted-imports` в `eslint.config.js`) запрещает
  импорты против направления слоёв и зависимости сборки в `web`.

Новый раздел резюме: имя в `sectionNames` (`src/core/config-schema.ts`),
подписи в `src/core/labels.ts`, компонент в `src/web/sections/` и запись в
реестре `src/web/sections/index.ts`.

## Деплой

`.github/workflows/deploy.yml` на push в `main` прогоняет lint, тесты, сборку с
PDF и публикует `dist/` на GitHub Pages (Settings → Pages → Source: GitHub Actions).

# Resume

Сайт-резюме и PDF из данных в `assets/`. Чтобы сделать резюме под себя,
достаточно поменять только эту папку.

## Контент

```
assets/
  config.yaml                 настройки: profile, lang, sections, formats, labels
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
  появляется переключатель (язык в URL: `?lang=en`), PDF и JSON собираются для
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

## Команды

```sh
bun run dev         # сайт с live-reload при правке assets/
bun run build       # dist/ + файлы для скачивания (resume.<язык>.pdf, .json…)
bun run build:site  # только сайт, без файлов для скачивания
bun run export      # только файлы для скачивания из уже собранного dist/
bun run test        # vitest
bun run schema      # перегенерировать schemas/ после правки схем
```

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
  build/             Node: загрузка assets/, Vite-плагин, экспортёры, CLI
    exporters/       по экспортёру на формат скачивания
    cli/             export.ts, schema.ts
  web/               React-приложение
    app/             точка входа, оболочка страницы, стили
    sections/        по компоненту на раздел резюме + реестр index.ts
    features/        download, language, theme (состояние на reatom)
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

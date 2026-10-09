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

Данные проверяются схемами из `src/resume/schema.ts`: при ошибке сборка падает
с указанием файла и поля. Из них же генерируются `schemas/*.schema.json` — с
расширением [YAML](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)
VS Code подсказывает поля и подчёркивает ошибки прямо в редакторе.

## Команды

```sh
bun run dev         # сайт с live-reload при правке assets/
bun run build       # dist/ + файлы для скачивания (resume.pdf, resume.json…)
bun run build:site  # только сайт, без PDF
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

Новый формат: добавить его в `src/resume/formats.ts`, написать экспортёр в
`exporters/` (функция `Exporter` из `exporters/types.ts`) и зарегистрировать в
`exporters/index.ts` — TypeScript не даст забыть последний шаг. Затем
`bun run schema`, чтобы редактор узнал новое значение `formats`.

## Деплой

`.github/workflows/deploy.yml` на push в `main` прогоняет lint, тесты, сборку с
PDF и публикует `dist/` на GitHub Pages (Settings → Pages → Source: GitHub Actions).

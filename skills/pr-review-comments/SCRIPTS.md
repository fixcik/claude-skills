# PR Review Scripts

Два основных скрипта для полного управления PR комментариями.

## Скрипт 1: fetch-pr-comments.ts

Извлекает комментарии из текущего PR.

**Использование:**
```bash
# Только комментарии от пользователей
npx tsx fetch-pr-comments.ts --only=userComments

# Комментарии от ботов (Coderabbit)
npx tsx fetch-pr-comments.ts --only=nitpicks,summaries

# Все типы (треды + юзеры + ботов)
npx tsx fetch-pr-comments.ts

# Показать уже помеченные как done/skip
npx tsx fetch-pr-comments.ts --include-done

# Сохраняет выходные данные в JSON
npx tsx fetch-pr-comments.ts > comments.json
```

**Доступные опции:**
- `--only=threads,userComments,nitpicks,summaries,files` — выбрать типы данных
- `--include-done` — включить уже помеченные комментарии
- Обновляет локальное состояние (~/.cursor/reviews/owner-repo-PR/pr-state.json)

---

## Скрипт 2: reply-or-mark.ts (Универсальный)

Один скрипт для:
- ✅ Ответов на один или много комментариев
- ✅ Разрешения (resolve) тредов
- ✅ Локальной пометки (done/skip/later)
- ✅ Batch обработки JSON файлов

### Режим 1: Один комментарий - только ответ

```bash
npx tsx reply-or-mark.ts thread "THREAD_ID" "Your reply here"

# Пример
npx tsx reply-or-mark.ts thread "MDEyOlB1bGxSZXF1ZXN0..." "Thanks! Fixed in abc123"
```

### Режим 2: Один комментарий - ответ + resolve

```bash
npx tsx reply-or-mark.ts thread "THREAD_ID" "Reply" --resolve

# Пример
npx tsx reply-or-mark.ts \
  thread "MDEyOlB1bGxSZXF1ZXN0..." \
  "Fixed!" \
  --resolve
```

### Режим 3: Один комментарий - ответ + resolve + пометка

```bash
npx tsx reply-or-mark.ts thread "THREAD_ID" "Reply" --resolve --status=done --note="note"

# Пример
npx tsx reply-or-mark.ts \
  thread "MDEyOlB1bGxSZXF1ZXN0..." \
  "Fixed in abc123" \
  --resolve \
  --status=done \
  --note="Fixed in commit abc123"
```

### Режим 4: Пометка без ответа

```bash
# Пометить тред
npx tsx reply-or-mark.ts thread "THREAD_ID" --status=done --note="reason"

# Пометить нитпик
npx tsx reply-or-mark.ts nitpick "file.ts:42-50" --status=skip --note="False positive"
```

### Режим 5: Batch обработка - из файла

```bash
# Из файла JSON
npx tsx reply-or-mark.ts batch comments.json

# Параллельная обработка (быстро, риск rate limiting)
npx tsx reply-or-mark.ts batch comments.json

# Последовательная обработка (медленно, безопасно)
npx tsx reply-or-mark.ts batch comments.json --sequential
```

### Режим 6: Batch обработка - из stdin

```bash
cat comments.json | npx tsx reply-or-mark.ts batch
```

## JSON Формат для Batch

```json
[
  {
    "id": "MDEyOlB1bGxSZXF1ZXN0...",
    "type": "thread",
    "reply": "Thanks! Fixed in commit abc123",
    "resolve": true,
    "status": "done",
    "note": "Fixed in abc123"
  },
  {
    "id": "MDEyOlB1bGxSZXF1ZXN0...",
    "type": "thread",
    "reply": "Out of scope for this PR",
    "status": "skip",
    "note": "Future work"
  },
  {
    "id": "path/to/file.ts:42-50",
    "type": "nitpick",
    "status": "skip",
    "note": "Already handled"
  }
]
```

**Обязательные поля:**
- `id`: threadId или nitpickId
- `type`: `thread` или `nitpick`

**Опциональные поля:**
- `reply`: Текст ответа (если не указан — только пометка)
- `resolve`: Разрешить тред (thread only, default false)
- `status`: `done`, `skip`, `later`
- `note`: Комментарий в локальном состоянии

## Локальное состояние

Сохраняется в: `~/.cursor/reviews/<owner>-<repo>-<number>/pr-state.json`

**Структура:**
```json
{
  "pr": "Super-Protocol/sp-swarm-services/35",
  "updatedAt": "2026-02-03T12:34:56.789Z",
  "threads": {
    "MDEy...": {
      "status": "done",
      "note": "Fixed"
    }
  },
  "nitpicks": {
    "path/file.ts:42-50": {
      "status": "skip",
      "note": "False positive"
    }
  }
}
```

## Workflow: Полный процесс

### Шаг 1: Получить комментарии
```bash
npx tsx fetch-pr-comments.ts --only=userComments > comments.json
```

### Шаг 2: Проверить и подготовить ответы
```bash
# Посмотреть что есть
jq '.userComments[] | {author, url, body}' comments.json

# Создать JSON с ответами (используй любой редактор)
cat > replies.json << 'EOF'
[
  {
    "id": "MDEy...",
    "type": "thread",
    "reply": "Fixed in abc123",
    "resolve": true,
    "status": "done"
  }
]
EOF
```

### Шаг 3: Отправить ответы
```bash
npx tsx reply-or-mark.ts batch replies.json --sequential
```

### Шаг 4: Проверить результат
```bash
# Должны исчезнуть помеченные комментарии
npx tsx fetch-pr-comments.ts --only=userComments
```

## Примеры

### Пример 1: Ответить на один комментарий

```bash
npx tsx reply-or-mark.ts \
  thread "MDEyOlB1bGxSZXF1ZXN0RDEyMzQ1Ng==" \
  "Thanks for the feedback! We've updated ApplicationTemplateIdSchema to use ObjectIdParamSchema for consistency with AssetIdSchema." \
  --resolve \
  --status=done
```

### Пример 2: Пометить нитпик как skip

```bash
npx tsx reply-or-mark.ts \
  nitpick "path/to/file.ts:42-50" \
  --status=skip \
  --note="False positive - format already validated"
```

### Пример 3: Batch с разными типами операций

```bash
cat > responses.json << 'EOF'
[
  {
    "id": "MDEyOlB1bGxSZXF1ZXN0RDEyMzQ1Ng==",
    "type": "thread",
    "reply": "Fixed in commit abc123",
    "resolve": true,
    "status": "done"
  },
  {
    "id": "MDEyOlB1bGxSZXF1ZXN0RDc4OTAxMg==",
    "type": "thread",
    "status": "skip",
    "note": "Out of scope"
  },
  {
    "id": "swarm-service-plugins/main.py:51-54",
    "type": "nitpick",
    "status": "skip",
    "note": "Format is controlled"
  }
]
EOF

npx tsx reply-or-mark.ts batch responses.json --sequential
```

## Производительность

**Контекст памяти:** ~8KB (очень компактно)

**Скорость:**
- Single: ~2 сек (включая GitHub API)
- Batch sequential (10 коммент): ~20 сек
- Batch parallel (10 коммент): ~10 сек

**GitHub API Лимиты:**
- Автоматическая задержка между коммент (500ms)
- Параллельное обработка: concurrency = 3
- Рекомендуется: не более 20 одновременно

## Ошибки и отладка

| Ошибка | Решение |
|--------|---------|
| `GraphQL Error: Node not found` | Тред удален или ID неверный |
| `Unexpected end of JSON input` | JSON синтаксис ошибка |
| `No such file or directory` | Проверь путь к файлу |
| `gh: command not found` | `brew install gh` |

## CLI Tips

```bash
# Быстрая обработка одного
npx tsx reply-or-mark.ts thread "ID" "Reply" --resolve

# Безопасная batch обработка
npx tsx reply-or-mark.ts batch file.json --sequential

# Просмотр что осталось
npx tsx fetch-pr-comments.ts --only=userComments
```

---

**Quick Start:** [QUICKSTART.md](./QUICKSTART.md)

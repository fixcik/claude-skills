# Quick Start Guide

## 1️⃣ Получить комментарии из PR

```bash
# Комментарии от пользователей (serega-k, marchuk-vlad и т.д.)
npx tsx ~/.cursor/skills/pr-review-comments/scripts/fetch-pr-comments.ts --only=userComments

# Все комментарии (пользователи + Coderabbit)
npx tsx ~/.cursor/skills/pr-review-comments/scripts/fetch-pr-comments.ts
```

## 2️⃣ Ответить на один комментарий

```bash
# Ответить на тред
npx tsx ~/.cursor/skills/pr-review-comments/scripts/reply-or-mark.ts \
  thread "MDEyOlB1bGxSZXF1ZXN0..." \
  "Thanks for the feedback. Fixed in commit abc123."

# Ответить и разрешить тред
npx tsx ~/.cursor/skills/pr-review-comments/scripts/reply-or-mark.ts \
  thread "MDEyOlB1bGxSZXF1ZXN0..." \
  "Fixed!" \
  --resolve

# Ответить, разрешить и пометить
npx tsx ~/.cursor/skills/pr-review-comments/scripts/reply-or-mark.ts \
  thread "MDEyOlB1bGxSZXF1ZXN0..." \
  "Fixed in abc123" \
  --resolve \
  --status=done
```

## 3️⃣ Пометить (без ответа)

```bash
# Пометить тред локально только
npx tsx ~/.cursor/skills/pr-review-comments/scripts/reply-or-mark.ts \
  thread "MDEyOlB1bGxSZXF1ZXN0..." \
  --status=done \
  --note="Fixed in abc123"

# Пометить нитпик
npx tsx ~/.cursor/skills/pr-review-comments/scripts/reply-or-mark.ts \
  nitpick "path/to/file.ts:42-50" \
  --status=skip \
  --note="False positive"
```

## 4️⃣ Batch обработка (много комментариев)

### Вариант A: Из JSON файла

```bash
# Создай replies.json
cat > replies.json << 'EOF'
[
  {
    "id": "MDEyOlB1bGxSZXF1ZXN0DQ==",
    "type": "thread",
    "reply": "Fixed!",
    "resolve": true,
    "status": "done"
  },
  {
    "id": "file.ts:42-50",
    "type": "nitpick",
    "status": "skip",
    "note": "Not applicable"
  }
]
EOF

# Обработай
npx tsx ~/.cursor/skills/pr-review-comments/scripts/reply-or-mark.ts \
  batch replies.json --sequential
```

### Вариант B: Из stdin

```bash
cat replies.json | npx tsx ~/.cursor/skills/pr-review-comments/scripts/reply-or-mark.ts batch
```

## Статусы комментариев

| Статус | Значение |
|--------|----------|
| `done` | Выполнено, ответ отправлен |
| `skip` | Пропустить, невалидно или вне scope |
| `later` | Отложить, обработать позже |

## Полезные команды

```bash
# Проверить статус (see что уже помечено)
npx tsx ~/.cursor/skills/pr-review-comments/scripts/fetch-pr-comments.ts --only=userComments

# Показать все, включая помеченные
npx tsx ~/.cursor/skills/pr-review-comments/scripts/fetch-pr-comments.ts --include-done

# Сохранить в файл
npx tsx ~/.cursor/skills/pr-review-comments/scripts/fetch-pr-comments.ts > my-comments.json

# Вывести только автора и URL
jq '.userComments[] | {author, url}' my-comments.json
```

## Типичный workflow

```bash
# 1. Получить комментарии
npx tsx ~/.cursor/skills/pr-review-comments/scripts/fetch-pr-comments.ts \
  --only=userComments > comments.json

# 2. Посмотреть комментарии
jq '.userComments[] | {author, url, body}' comments.json

# 3. Создать replies.json с ответами
# (используй редактор - скопируй ID и напиши ответы)

# 4. Отправить ответы
npx tsx ~/.cursor/skills/pr-review-comments/scripts/reply-or-mark.ts \
  batch replies.json --sequential

# 5. Проверить что все помечено
npx tsx ~/.cursor/skills/pr-review-comments/scripts/fetch-pr-comments.ts \
  --only=userComments
```

## Примеры JSON для batch

### Пример 1: Смешанные ответы

```json
[
  {
    "id": "MDEyOlB1bGxSZXF1ZXN0RDEyMzQ1Ng==",
    "type": "thread",
    "reply": "Fixed! Updated ApplicationTemplateIdSchema to use ObjectIdParamSchema.",
    "resolve": true,
    "status": "done"
  },
  {
    "id": "MDEyOlB1bGxSZXF1ZXN0RDc4OTAxMg==",
    "type": "thread",
    "reply": "Out of scope for this PR",
    "status": "skip"
  },
  {
    "id": "path/to/file.ts:42-50",
    "type": "nitpick",
    "status": "skip",
    "note": "Already handled"
  }
]
```

### Пример 2: Только пометки (без ответов)

```json
[
  {
    "id": "MDEyOlB1bGxSZXF1ZXN0RDEyMzQ1Ng==",
    "type": "thread",
    "status": "done"
  },
  {
    "id": "path/file.ts:10-20",
    "type": "nitpick",
    "status": "skip",
    "note": "False positive from Coderabbit"
  }
]
```

## Ошибки и отладка

| Ошибка | Решение |
|--------|---------|
| `GraphQL Error: Node not found` | Тред удален или ID неверный |
| `Unexpected end of JSON input` | JSON синтаксис ошибка или пустой файл |
| `No such file or directory` | Проверь путь к файлу |
| `gh: command not found` | Установи GitHub CLI: `brew install gh` |

---

**Более подробно:** [SCRIPTS.md](./SCRIPTS.md)

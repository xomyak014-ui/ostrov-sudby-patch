# Остров Судьбы — страница патчноутов SCUM

- **Discord:** https://discord.gg/df8m4UmWmp
- **WarGM:** https://wargm.ru/server/81248

## Публикация на GitHub Pages (пошагово)

### 1. Регистрация на GitHub

Если аккаунта нет — зарегистрируйтесь на [github.com](https://github.com/signup). Это бесплатно.

### 2. Создайте репозиторий

1. Откройте [github.com/new](https://github.com/new)
2. **Repository name:** например `ostrov-sudby-patch` (латиницей, без пробелов)
3. **Public** — обязательно
4. Галочки «Add README» и прочие — **не ставьте** (репозиторий пустой)
5. **Create repository**

### 3. Загрузите файлы

**Способ А — через сайт (проще):**

1. На странице нового репозитория: **Add file → Upload files**
2. Перетащите **всё содержимое** папки `ostrov-sudby-june-update`:
   - `index.html`
   - папку `assets/` (все картинки внутри)
   - папку `.github/` (автопубликация)
   - файлы `.nojekyll`, `netlify.toml`, `README.md` — по желанию
3. Внизу: **Commit changes**

**Способ Б — через Git в терминале:**

```powershell
cd "ПУТЬ\К\ostrov-sudby-june-update"
git init
git add .
git commit -m "Страница патчноутов SCUM — Остров Судьбы"
git branch -M main
git remote add origin https://github.com/ВАШ_НИК/ostrov-sudby-patch.git
git push -u origin main
```

Замените `ВАШ_НИК` и имя репозитория на свои.

### 4. Включите GitHub Pages

1. Репозиторий → **Settings** (вкладка сверху)
2. Слева **Pages**
3. В **Build and deployment → Source** выберите **GitHub Actions**
4. Если после загрузки файлов workflow ещё не запускался — подождите 1–2 минуты или зайдите во вкладку **Actions** и дождитесь зелёной галочки «Deploy to GitHub Pages»

### 5. Получите ссылку

После успешного деплоя в **Settings → Pages** появится адрес:

```
https://ВАШ_НИК.github.io/ostrov-sudby-patch/
```

Откройте в браузере — должна открыться ваша страница с Discord и WarGM.

### 6. Закрепите в Discord

В канале объявлений:

```
📋 SCUM: Into the Wild — Июньское обновление 1.3.1
Полный русский перевод патчноутов:
👉 https://ВАШ_НИК.github.io/ostrov-sudby-patch/

🏝️ Наш сервер: https://wargm.ru/server/81248
💬 Discord: https://discord.gg/df8m4UmWmp
```

---

## Обновление страницы позже

1. Измените `index.html` локально
2. Загрузите новый файл на GitHub (Upload files → заменить) **или** `git add .` → `git commit` → `git push`
3. Через 1–2 минуты сайт обновится сам

## Если что-то не работает

| Проблема | Решение |
|----------|---------|
| 404 на сайте | Проверьте, что `index.html` в **корне** репозитория, не во вложенной папке |
| Нет картинок | Убедитесь, что папка `assets/` загружена целиком |
| Actions не запускается | Settings → Pages → Source = **GitHub Actions** |
| Сайт старый | Очистите кэш браузера (Ctrl+F5) |

---

Оригинал патчноутов: [Steam](https://store.steampowered.com/news/app/513710/view/701020348316910158)

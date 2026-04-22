# jjjsksks

the interpreter is here

```
https://github.com/PGT-language/start-compilers
```

start use project

```
git clone https://github.com/PGT-language/start-compilers.git
cd start-compilers
python3 instal.py
```

Generated with `pgt init backend jjjsksks`.

## Structure

- `main.pgt` starts the app and stays intentionally small.
- `runtime/runtime.pgt` prepares logging and database startup.
- `routes/routes.pgt` registers HTTP routes.
- `api/api.pgt` contains request handlers.
- `api/posts.pgt` contains blog post API handlers and the dynamic post page handlers.
- `data/posts.json` contains the JSON-backed blog posts.
- `static/index.html`, `static/index.css`, and `static/index.js` contain the main frontend page.
- `static/register.html`, `static/register.css`, and `static/register.js` contain the registration page.
- `static/login.html`, `static/login.css`, and `static/login.js` contain the login page.
- `sweiger/index.html` contains Swagger UI served from `/api/v1/docs`.
- `sweiger/sweiger.pgt` contains Swagger route handlers.
- `api.yaml` contains the editable API specification served from `/api/v1/openapi.yaml`.
- `components/logging/logging.pgt` wraps log output and log levels.
- `auth/auth.pgt` contains register, login, and JWT verify handlers.
- `models/user/user.pgt` contains the generated auth user model.
- `models/comment/comment.pgt` contains the comment ORM model.
- `models/reaction/reaction.pgt` contains the like/dislike ORM model.
- `models/init/init-db.pgt` runs database migrations and ORM save helpers.

## Run

```bash
pgt run main.pgt
```

## API Examples

```bash
curl http://localhost:5000/
curl http://localhost:5000/post
curl http://localhost:5000/api
curl http://localhost:5000/api/posts
curl http://localhost:5000/api/comments
curl http://localhost:5000/api/reactions
curl http://localhost:5000/api/v1/docs
curl http://localhost:5000/api/v1/openapi.yaml
curl -X POST http://localhost:5000/api \
  -H 'Content-Type: application/json' \
  -d '{"message":"hello"}'
curl -X POST http://localhost:5000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Pabla","email":"pabla@example.com","password":"secret"}'
curl -X POST http://localhost:5000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"pabla@example.com","password":"secret"}'
curl -X POST http://localhost:5000/api/comments \
  -H 'Content-Type: application/json' \
  -d '{"post_id":"pgt-json-blog","user_id":"guest","author_name":"Pabla","body":"Looks alive.","created_at":"2026-04-22T12:00:00.000Z"}'
curl -X POST http://localhost:5000/api/comments/by-post \
  -H 'Content-Type: application/json' \
  -d '{"post_id":"pgt-json-blog"}'
curl -X POST http://localhost:5000/api/reactions \
  -H 'Content-Type: application/json' \
  -d '{"post_id":"pgt-json-blog","user_id":"guest","kind":"like","created_at":"2026-04-22T12:00:00.000Z"}'
curl -X POST http://localhost:5000/api/reactions/by-post \
  -H 'Content-Type: application/json' \
  -d '{"post_id":"pgt-json-blog"}'
```

## Static Files

The root route returns `static/index.html`. Edit the files in `static/` to change the page, styles, and browser script.

## API Spec

Open `/api/v1/docs` for Swagger UI. Edit `api.yaml` when you add routes; the backend serves it at `/api/v1/openapi.yaml`.

## Logging

Logging is configured in `runtime/runtime.pgt`.
Current output: `file`, level: `info`.

## Database

The app opens `app.sqlite` during startup and runs `migrate()` from `runtime/runtime.pgt`.
Startup migrates `User`, `Comment`, and `Reaction`. Posts stay in `data/posts.json`; submitted comments and reactions are saved through ORM models.

## Auth

Auth routes are `/auth/register`, `/auth/login`, and `/auth/verify`.
Change the JWT secret in `auth/auth.pgt` before production.

## Docker

The Dockerfile uses the PGT runtime image `pablaofficeal/pgt-language:latest` by default.

```bash
docker compose up --build
```

Use another runtime image with:

```bash
docker compose build --build-arg PGT_IMAGE=your/image:tag
```

## Nginx

Nginx config lives in `nginx/default.conf` and proxies traffic to the app on port 5000.

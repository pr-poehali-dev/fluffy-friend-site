import json
import os
import hashlib
import secrets
import psycopg2

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def handler(event: dict, context) -> dict:
    """Авторизация PawSpace: action=register/login/me/update"""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Session-Id",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    body = json.loads(event.get("body") or "{}")
    qs = event.get("queryStringParameters") or {}
    action = body.get("action") or qs.get("action") or ""
    session_id = (event.get("headers") or {}).get("x-session-id") or (event.get("headers") or {}).get("X-Session-Id")

    conn = get_conn()
    cur = conn.cursor()

    try:
        if action == "register":
            email = body.get("email", "").strip().lower()
            password = body.get("password", "")
            name = body.get("name", "").strip()

            if not email or not password or not name:
                return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Заполните все поля"})}
            if len(password) < 6:
                return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Пароль минимум 6 символов"})}

            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cur.fetchone():
                return {"statusCode": 409, "headers": cors, "body": json.dumps({"error": "Email уже зарегистрирован"})}

            cur.execute("INSERT INTO users (email, password_hash, name) VALUES (%s, %s, %s) RETURNING id", (email, hash_password(password), name))
            user_id = cur.fetchone()[0]
            sid = secrets.token_hex(32)
            cur.execute("INSERT INTO sessions (id, user_id) VALUES (%s, %s)", (sid, user_id))
            conn.commit()
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"session_id": sid, "user": {"id": user_id, "name": name, "email": email, "city": "", "bio": "", "avatar": ""}})}

        if action == "login":
            email = body.get("email", "").strip().lower()
            password = body.get("password", "")
            cur.execute("SELECT id, name, city, bio, avatar FROM users WHERE email = %s AND password_hash = %s", (email, hash_password(password)))
            row = cur.fetchone()
            if not row:
                return {"statusCode": 401, "headers": cors, "body": json.dumps({"error": "Неверный email или пароль"})}
            user_id, name, city, bio, avatar = row
            sid = secrets.token_hex(32)
            cur.execute("INSERT INTO sessions (id, user_id) VALUES (%s, %s)", (sid, user_id))
            conn.commit()
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"session_id": sid, "user": {"id": user_id, "name": name, "email": email, "city": city or "", "bio": bio or "", "avatar": avatar or ""}})}

        if action == "me":
            if not session_id:
                return {"statusCode": 401, "headers": cors, "body": json.dumps({"error": "Нет сессии"})}
            cur.execute("SELECT u.id, u.name, u.email, u.city, u.bio, u.avatar FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = %s", (session_id,))
            row = cur.fetchone()
            if not row:
                return {"statusCode": 401, "headers": cors, "body": json.dumps({"error": "Сессия не найдена"})}
            uid, name, email, city, bio, avatar = row
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"user": {"id": uid, "name": name, "email": email, "city": city or "", "bio": bio or "", "avatar": avatar or ""}})}

        if action == "update":
            if not session_id:
                return {"statusCode": 401, "headers": cors, "body": json.dumps({"error": "Нет сессии"})}
            cur.execute("SELECT user_id FROM sessions WHERE id = %s", (session_id,))
            row = cur.fetchone()
            if not row:
                return {"statusCode": 401, "headers": cors, "body": json.dumps({"error": "Сессия не найдена"})}
            uid = row[0]
            cur.execute("UPDATE users SET name=COALESCE(%s,name), city=COALESCE(%s,city), bio=COALESCE(%s,bio), avatar=COALESCE(%s,avatar) WHERE id=%s",
                        (body.get("name"), body.get("city"), body.get("bio"), body.get("avatar"), uid))
            conn.commit()
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"ok": True})}

        return {"statusCode": 404, "headers": cors, "body": json.dumps({"error": "Not found"})}

    finally:
        cur.close()
        conn.close()

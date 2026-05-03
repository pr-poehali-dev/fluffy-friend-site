import json
import os
import psycopg2

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def get_user_id(cur, session_id):
    if not session_id:
        return None
    cur.execute("SELECT user_id FROM sessions WHERE id = %s", (session_id,))
    row = cur.fetchone()
    return row[0] if row else None

def handler(event: dict, context) -> dict:
    """Посты PawSpace: action=feed/create/like/comments/comment"""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Session-Id",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    body = json.loads(event.get("body") or "{}")
    qs = event.get("queryStringParameters") or {}
    action = body.get("action") or qs.get("action") or "feed"
    session_id = (event.get("headers") or {}).get("x-session-id") or (event.get("headers") or {}).get("X-Session-Id")

    conn = get_conn()
    cur = conn.cursor()

    try:
        if action == "feed":
            user_id = get_user_id(cur, session_id)
            cur.execute("""
                SELECT p.id, p.text, p.pet_name, p.species, p.image, p.created_at,
                       u.id, u.name, u.avatar,
                       (SELECT COUNT(*) FROM post_likes l WHERE l.post_id = p.id),
                       (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id),
                       CASE WHEN %s IS NOT NULL AND EXISTS(SELECT 1 FROM post_likes l WHERE l.post_id = p.id AND l.user_id = %s) THEN true ELSE false END
                FROM posts p JOIN users u ON p.user_id = u.id
                ORDER BY p.created_at DESC LIMIT 50
            """, (user_id, user_id))
            rows = cur.fetchall()
            posts = [{"id": r[0], "text": r[1], "petName": r[2], "species": r[3], "image": r[4],
                      "time": str(r[5]), "userId": r[6], "userName": r[7], "userAvatar": r[8] or "",
                      "likes": int(r[9]), "comments": int(r[10]), "liked": r[11]} for r in rows]
            return {"statusCode": 200, "headers": cors, "body": json.dumps(posts)}

        if action == "create":
            user_id = get_user_id(cur, session_id)
            if not user_id:
                return {"statusCode": 401, "headers": cors, "body": json.dumps({"error": "Необходима авторизация"})}
            text = body.get("text", "").strip()
            if not text:
                return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Текст обязателен"})}
            cur.execute("INSERT INTO posts (user_id, text, pet_name, species, image) VALUES (%s,%s,%s,%s,%s) RETURNING id",
                        (user_id, text, body.get("petName", ""), body.get("species", ""), body.get("image", "")))
            post_id = cur.fetchone()[0]
            conn.commit()
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"id": post_id})}

        if action == "like":
            user_id = get_user_id(cur, session_id)
            if not user_id:
                return {"statusCode": 401, "headers": cors, "body": json.dumps({"error": "Необходима авторизация"})}
            post_id = body.get("postId")
            cur.execute("SELECT 1 FROM post_likes WHERE user_id=%s AND post_id=%s", (user_id, post_id))
            if cur.fetchone():
                cur.execute("DELETE FROM post_likes WHERE user_id=%s AND post_id=%s", (user_id, post_id))
                liked = False
            else:
                cur.execute("INSERT INTO post_likes (user_id, post_id) VALUES (%s,%s)", (user_id, post_id))
                liked = True
            conn.commit()
            cur.execute("SELECT COUNT(*) FROM post_likes WHERE post_id=%s", (post_id,))
            count = cur.fetchone()[0]
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"liked": liked, "likes": int(count)})}

        if action == "comments":
            post_id = qs.get("postId") or body.get("postId")
            cur.execute("""
                SELECT c.id, c.text, c.created_at, u.name, u.avatar
                FROM comments c JOIN users u ON c.user_id = u.id
                WHERE c.post_id = %s ORDER BY c.created_at ASC
            """, (post_id,))
            rows = cur.fetchall()
            comments = [{"id": r[0], "text": r[1], "time": str(r[2]), "userName": r[3], "userAvatar": r[4] or ""} for r in rows]
            return {"statusCode": 200, "headers": cors, "body": json.dumps(comments)}

        if action == "comment":
            user_id = get_user_id(cur, session_id)
            if not user_id:
                return {"statusCode": 401, "headers": cors, "body": json.dumps({"error": "Необходима авторизация"})}
            post_id = body.get("postId")
            text = body.get("text", "").strip()
            if not text:
                return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Текст обязателен"})}
            cur.execute("INSERT INTO comments (post_id, user_id, text) VALUES (%s,%s,%s) RETURNING id", (post_id, user_id, text))
            comment_id = cur.fetchone()[0]
            conn.commit()
            cur.execute("SELECT name, avatar FROM users WHERE id=%s", (user_id,))
            u = cur.fetchone()
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"id": comment_id, "text": text, "userName": u[0], "userAvatar": u[1] or "", "time": "только что"})}

        return {"statusCode": 404, "headers": cors, "body": json.dumps({"error": "Not found"})}

    finally:
        cur.close()
        conn.close()

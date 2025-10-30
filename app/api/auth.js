/**
 * File: /app/api/auth.js
 * Purpose: (auto-added during Portable Cleanup) — add a concise, human-readable purpose for this file.
 * Process: Part of HomeFix portable refactor; no functional changes made by header.
 * Dependencies: Review local imports; ensure single supabase client in /lib when applicable.
 * Note: This header is documentation-only and safe to remove or edit.
 */
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// In production, use a real DB (Supabase/Postgres). Example uses memory store:
let users = [];

exports.handler = async (event) => {
  const { username, password, type } = JSON.parse(event.body);

  if (type === "signup") {
    const existing = users.find(u => u.username === username);
    if (existing) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: "User exists" }) };
    }
    const hash = await bcrypt.hash(password, 10);
    users.push({ username, password: hash });
    return { statusCode: 200, body: JSON.stringify({ ok: true, message: "Signup success" }) };
  }

  if (type === "login") {
    const user = users.find(u => u.username === username);
    if (!user) return { statusCode: 400, body: JSON.stringify({ ok: false, error: "User not found" }) };

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return { statusCode: 401, body: JSON.stringify({ ok: false, error: "Invalid password" }) };

    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return { statusCode: 200, body: JSON.stringify({ ok: true, token }) };
  }

  return { statusCode: 400, body: JSON.stringify({ ok: false, error: "Invalid request" }) };
};

import { createCookie } from "@remix-run/node";

export const userTokenCookie = createCookie("token", {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  secure: false,
  maxAge: 60 * 60 * 24 * 7, // 1 semana
});

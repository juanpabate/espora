import { type ActionFunctionArgs } from "@remix-run/node";
import { userTokenCookie } from "utils/session";

export async function action({ request }: ActionFunctionArgs) {
  const { token } = await request.json();

  if (!token) {
    return new Response(JSON.stringify({ error: "Token no proporcionado" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": await userTokenCookie.serialize(token),
    },
  });
}

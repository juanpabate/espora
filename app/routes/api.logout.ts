import { redirect } from "@remix-run/node";
import { auth } from "../../firebase/connection.js";
import { signOut } from "firebase/auth";
import { userTokenCookie } from "utils/session.js";

export const action = async () => {
  try {
    await signOut(auth);

    const cookie = await userTokenCookie.serialize("", { maxAge: 0 });
    console.log("Sesión cerrada correctamente");

    return redirect("/login", {
      headers: {
        "Set-Cookie": cookie,
      },
    });
  } catch (error) {
    console.log(error);
    return { error: error, status: 400 };
  }
};

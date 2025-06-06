import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { userTokenCookie } from "utils/session.js";
import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigate,
} from "@remix-run/react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import {
  auth,
  googleProvider,
  facebookProvider,
  db,
} from "../../firebase/connection.js";
import { useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { adminAuth } from "firebase/admin.js";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const cookieHeader = request.headers.get("Cookie");
    const token = await userTokenCookie.parse(cookieHeader);

    if (!token) {
      // No hay token, redirige al login
      return null;
    }
    const decodedToken = await adminAuth.verifyIdToken(token);

    const docSnap = await getDoc(doc(db, "users", decodedToken.uid));

    if (!docSnap.data()?.registerCompleted && docSnap.data()?.email) {
      return redirect("/completar-registro");
    }
    console.log("Auth login ok:", decodedToken.email);
    return redirect("/inicio");
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  const email = form.get("email")?.toString();
  const password = form.get("password")?.toString();
  try {
    if (!email || !password) {
      return { error: "Debes completar todos los campos." };
    }
    const result = await signInWithEmailAndPassword(auth, email, password);
    const token = await result.user.getIdToken();
    // console.log("Token:", token);

    const docSnap = await getDoc(doc(db, "users", result.user.uid));
    if (!docSnap.exists() || !docSnap.data()?.registerCompleted) {
      return redirect("/completar-registro", {
        headers: {
          "Set-Cookie": await userTokenCookie.serialize(token),
        },
      });
    }
    return redirect("/inicio", {
      headers: {
        "Set-Cookie": await userTokenCookie.serialize(token),
      },
    });
  } catch (error: any) {
    return {
      error:
        "Tu contraseña o nombre de usuario no son correctos. Comprueba la información y vuelve a intentarlo.",
    };
  }
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const actionData = useActionData<typeof action>();

  const navigate = useNavigate();

  async function handleGoogleLogin() {
    console.log("cick en google");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result?.user) {
        const token = await result.user.getIdToken();

        await fetch("/api/set-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const docSnap = await getDoc(doc(db, "users", result.user.uid));
        if (!docSnap.exists()) {
          await setDoc(doc(db, "users", result.user.uid), {
            userName: result.user.displayName,
            email: result.user.email,
            name: result.user.displayName,
            registerCompleted: false,
            followed: [],
            followers: [],
            likedPostIds: [],
            savedPostIds: [],
          });
          return navigate("/completar-registro");
        }
        if (docSnap.exists() && docSnap.data().registerCompleted === false) {
          return navigate("/completar-registro");
        }
        return navigate("/inicio");
      }
    } catch (error) {
      console.error("Error al iniciar con Google:", error);
      // alert("Error al iniciar con Google" + error);
    }
  }

  async function handleFacebookLogin() {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      if (result?.user) {
        const token = await result.user.getIdToken();

        await fetch("/api/set-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const docSnap = await getDoc(doc(db, "users", result.user.uid));
        if (!docSnap.exists()) {
          await setDoc(doc(db, "users", result.user.uid), {
            userName: result.user.displayName,
            email: result.user.email,
            name: result.user.displayName,
            registerCompleted: false,
            followed: [],
            followers: [],
            likedPostIds: [],
            savedPostIds: [],
          });
          return navigate("/completar-registro");
        }
        if (docSnap.exists() && docSnap.data().registerCompleted === false) {
          return navigate("/completar-registro");
        }
        return navigate("/inicio");
      }
    } catch (error) {
      console.error("Error al iniciar con Facebook:", error);
      // alert("Error al iniciar con Facebook" + error);
    }
  }

  return (
    <main className="bg-[linear-gradient(180deg,_#F46868_0%,_#302B4F_100%)] h-screen text-white flex">
      <section className="w-2/3 bg-svg-custom flex flex-col items-center justify-center pr-10">
        <img src="/logo-blanco.svg" alt="Logo de Espora" className="w-1/2" />
        <h2 className="text-5xl text-center font-extralight">
          <span className="font-semibold block font-sans">
            La comunidad de artistas
          </span>
          del Valle de Aburrá
        </h2>
      </section>
      <section className="flex flex-col w-1/3 justify-center mr-40">
        <h2 className="text-3xl font-bold text-center mb-8">Inicia sesión</h2>
        <Form method="post" className="flex flex-col items-center">
          <button
            type="button"
            className="border-white border-2 rounded-xl p-2 w-full text-md flex justify-center font-extralight"
            onClick={handleGoogleLogin}
          >
            <div className="flex gap-3 w-52">
              <img src="/google-icon.svg" className="w-4" />
              <p>Continúa con Google</p>
            </div>
          </button>

          <button
            type="button"
            className="border-white border-2 rounded-xl p-2 w-full text-md flex justify-center font-extralight mt-2"
            onClick={handleFacebookLogin}
          >
            <div className="flex gap-3 w-52">
              <img src="/facebook-icon.svg" className="w-4" />
              <p>Continúa con Facebook</p>
            </div>
          </button>

          <p className="font-extralight my-8">
            O ingresa con tu correo electrónico
          </p>

          <div className="input-group font-extralight w-[calc(100%-3rem)] mb-2">
            <input type="email" id="email" name="email" placeholder=" " />
            <label htmlFor="email" className="label-group">
              Correo electrónico
            </label>
          </div>

          <div className="input-group font-extralight w-[calc(100%-3rem)] relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder=" "
            />
            <label htmlFor="password" className="label-group">
              Contraseña
            </label>
            <img
              src={showPassword ? "/show.svg" : "/hide.svg"}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>

          {actionData?.error && (
            <p className="font-extralight text-orange-300 text-sm mt-3 text-center w-[calc(100%-8rem)]">
              {actionData.error}
            </p>
          )}

          <button
            type="submit"
            className="w-full text-center p-3 font-bold text-white rounded-xl bg-[linear-gradient(to_left,_#DF6ABADB,_#B72EB2D6_35%)] mt-8"
          >
            Iniciar sesión
          </button>
        </Form>

        <p className="font-bold text-center my-4">¿Olvidaste tu contraseña?</p>
        <div className="flex w-full gap-3 justify-center">
          <p className="font-extralight">¿No tienes una cuenta?</p>
          <Link to={"/registro"} className="font-bold">
            Crear una cuenta
          </Link>
        </div>
      </section>
    </main>
  );
}

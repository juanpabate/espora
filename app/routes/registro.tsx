import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  auth,
  googleProvider,
  facebookProvider,
  db,
} from "../../firebase/connection.js";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigate,
} from "@remix-run/react";
import { useState } from "react";
import { getDoc, doc, setDoc } from "firebase/firestore";
import { userTokenCookie } from "utils/session.js";
import { adminAuth } from "firebase/admin.js";

export const loader = async ({ request }: LoaderFunctionArgs) => {
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
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  const email = form.get("email")?.toString().trim();
  const password = form.get("password")?.toString();
  const confirmPassword = form.get("confirm-password")?.toString();
  const name = form.get("nombre")?.toString().trim();
  const userName = form.get("usuario")?.toString().trim();

  try {
    if (!email || !password || !confirmPassword || !name || !userName)
      throw new Error("Faltan campos");

    if (password !== confirmPassword)
      throw new Error("Las contraseñas no coinciden");

    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await updateProfile(user, {
      displayName: name,
    });

    await setDoc(doc(db, "users", user.uid), {
      userName,
      email,
      name,
      registerCompleted: false,
      followed: [],
      followers: [],
      likedPostIds: [],
      savedPostIds: [],
    });

    const token = await user.getIdToken();

    return redirect("/completar-registro", {
      headers: {
        "Set-Cookie": await userTokenCookie.serialize(token),
      },
    });
  } catch (error: any) {
    console.log(error.message);
    return { error: error.message, status: 400 };
  }
};

export default function Registro() {
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
    <main className="flex flex-col bg-[linear-gradient(180deg,_#F46868_0%,_#302B4F_100%)] h-screen text-white items-center justify-center">
      <img src="/logo-blanco.svg" alt="Logo espora" className="w-80 mb-8" />
      <section className=" w-2/4">
        <h3 className="text-2xl font-bold text-center mb-3">
          Regístrate y lleva tu trabajo artístico a otro nivel
        </h3>
        <div className="flex gap-4">
          <button
            type="button"
            className="border-white border-2 rounded-xl p-2 w-full text-md flex justify-center font-extralight mt-2"
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
        </div>
      </section>
      <section className="w-1/3 mt-2">
        <div className="flex flex-col items-center">
          <p className="font-extralight my-4">
            O ingresa con tu correo electrónico
          </p>
          <Form
            method="post"
            className="flex flex-col gap-3 w-full items-center"
          >
            <div className="input-group font-extralight w-full">
              <input type="email" id="email" name="email" placeholder=" " />
              <label htmlFor="email" className="label-group">
                Correo electrónico
              </label>
            </div>
            <div className="input-group font-extralight w-full relative">
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
            <div className="input-group font-extralight w-full relative">
              <input
                type={showPassword ? "text" : "password"}
                id="confirm-password"
                name="confirm-password"
                placeholder=" "
              />
              <label htmlFor="confirm-password" className="label-group">
                Confirmar contraseña
              </label>
              <img
                src={showPassword ? "/show.svg" : "/hide.svg"}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>
            <div className="input-group font-extralight w-full">
              <input type="text" id="nombre" name="nombre" placeholder=" " />
              <label htmlFor="nombre" className="label-group">
                Nombre de completo
              </label>
            </div>
            <div className="input-group font-extralight w-full">
              <input type="text" id="usuario" name="usuario" placeholder=" " />
              <label htmlFor="usuario" className="label-group">
                Nombre de usuario
              </label>
            </div>
            {actionData?.error && (
              <p className="font-extralight text-orange-300 text-sm text-center w-[calc(100%-8rem)]">
                {actionData.error}
              </p>
            )}
            <button
              type="submit"
              className="w-1/3 text-center p-2 font-bold text-white rounded-xl bg-[linear-gradient(to_left,_#DF6ABADB,_#B72EB2D6_35%)] my-4"
            >
              Registrarse
            </button>
          </Form>
          <p className="font-extralight text-sm mb-3">¿Ya tienes una cuenta?</p>
          <Link to={"/login"} className="font-bold">
            Iniciar sesión
          </Link>
        </div>
      </section>
    </main>
  );
}

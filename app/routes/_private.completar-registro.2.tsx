import { Form, redirect, useActionData } from "@remix-run/react";
import React, { useState } from "react";
import CustomSelectOption from "~/components/CustomSelectOption";
import "react-day-picker/style.css";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { userTokenCookie } from "utils/session";
import { adminAuth } from "firebase/admin";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { db } from "firebase/connection";
import { categories } from "~/lib/constants";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookieHeader = request.headers.get("Cookie");
  const token = await userTokenCookie.parse(cookieHeader);

  const decodedToken = await adminAuth.verifyIdToken(token);

  const docSnap = await getDoc(doc(db, "users", decodedToken.uid));

  if (docSnap.data()?.registerCompleted) return redirect("/inicio");

  return docSnap.data() || null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  const category = form.get("category")?.toString().trim();
  const artisticStyle = form.get("artisticStyle")?.toString().trim();
  const aboutYourProject = form.get("aboutYourProject")?.toString().trim();
  const wantsFromEspora = form.get("wantsFromEspora")?.toString().trim();

  if (!category || !artisticStyle || !aboutYourProject || !wantsFromEspora)
    return { error: "Debes completar todos los campos" };

  try {
    const cookie = request.headers.get("Cookie");
    const token = await userTokenCookie.parse(cookie);
    const decodedToken = await adminAuth.verifyIdToken(token);

    await setDoc(
      doc(db, "users", decodedToken.uid),
      {
        category,
        artisticStyle,
        aboutYourProject,
        wantsFromEspora,
        registerCompleted: true,
      },
      { merge: true }
    );

    return redirect("/inicio");
  } catch (error) {
    return { error: "Ocurrió un error, vuelve a intentarlo más tarde" };
  }
};

export default function CompletarRegistro2() {
  const [openSelect, setOpenSelect] = useState<boolean>(false);
  const [selected, setSelected] = useState<string | undefined>("");

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  return (
    <div className="overflow-scroll max-h-screen w-2/3">
      <div className="h-2/3 flex flex-col justify-end gap-16 my-10">
        <div>
          <p className="font-extralight text-3xl">Paso 2</p>
          <p className="font-bold text-3xl">Perfil creativo</p>
        </div>

        <Form
          method="post"
          className="min-h-[calc(50%+2rem)] flex flex-col font-extralight pr-6"
        >
          <label htmlFor="category" className="font-extralight mb-2">
            ¿Qué tipo de creador(a) eres?
          </label>

          <div className="bg-transparent border-2 border-white rounded-xl min-h-12 flex flex-column justify-center focus:outline-none cursor-pointer flex-wrap mb-2">
            <div
              className="flex justify-between items-center w-full px-4 h-12"
              onClick={() => setOpenSelect(!openSelect)}
            >
              <p
                className={
                  openSelect
                    ? "text-orange-300"
                    : selected
                    ? "text-white"
                    : "text-gray-400"
                }
              >
                {selected ? selected : "Elije una categoria"}
              </p>
              <img src="/arrow-select.svg" alt="select-arrow" />
            </div>
            {openSelect && (
              <div className="flex flex-col w-full">
                {categories.map((category) => (
                  <CustomSelectOption
                    name={category}
                    onClick={() => {
                      setSelected(category);
                      setOpenSelect(false);
                    }}
                    isSelected={category === selected}
                  />
                ))}
              </div>
            )}
          </div>

          <input
            type="hidden"
            name="category"
            value={selected ? selected : ""}
          />

          <label htmlFor="artisticStyle" className="font-extralight mb-2">
            ¿Cómo definirías tu estilo artístico?
          </label>
          <textarea
            name="artisticStyle"
            placeholder="(Una frase corta o palabra clave)"
            rows={1}
            maxLength={200}
            onInput={handleInput}
            className="bg-transparent border-2 border-white rounded-xl focus:outline-none mb-2 p-3 resize-none overflow-hidden leading-snug min-h-12"
          />

          <label htmlFor="aboutYourProject" className="font-extralight mb-2">
            Cuéntanos un poco sobre ti o tu proyecto
          </label>
          <textarea
            name="aboutYourProject"
            placeholder="(Este será tu bio visible en el perfil)"
            rows={1}
            onInput={handleInput}
            className="bg-transparent border-2 border-white rounded-xl focus:outline-none mb-2 p-3 resize-none overflow-hidden leading-snug min-h-12"
          />

          <label htmlFor="wantsFromEspora" className="font-extralight mb-2">
            ¿Qué te gustaría encontrar en Espora?
          </label>
          <textarea
            name="wantsFromEspora"
            placeholder="(Conectar, mostrar tu arte, vender, colaborar...)"
            rows={1}
            onInput={handleInput}
            className="bg-transparent border-2 border-white rounded-xl focus:outline-none mb-2 p-3 resize-none overflow-hidden leading-snug min-h-12"
          />

          {/* {error && (
        <p className="font-extralight text-orange-300 text-sm mt-3 w-[calc(100%-8rem)]">
          {error}
        </p>
      )} */}
          <div className="font-extralight mt-20">
            <button type="submit" className="flex gap-4 text-3xl p-2">
              Siguiente
              <img src="/arrow-right.svg" alt="Siguiente" className="w-12" />
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}

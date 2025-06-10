import { Form, redirect, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import "react-day-picker/style.css";
import { es } from "date-fns/locale";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { differenceInYears } from "date-fns";
import { db } from "firebase/connection";
import { adminAuth } from "firebase/admin";
import { userTokenCookie } from "utils/session";
import { doc, setDoc, getDoc } from "firebase/firestore";

type ActionData = {
  error?: string;
};

type LoaderData = {
  birthdate?: string;
  country?: string;
  region?: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookieHeader = request.headers.get("Cookie");
  const token = await userTokenCookie.parse(cookieHeader);

  const decodedToken = await adminAuth.verifyIdToken(token);

  const docSnap = await getDoc(doc(db, "users", decodedToken.uid));

  if (docSnap.data()?.registerCompleted) return redirect("/inicio");

  // console.log(docSnap.data());
  return docSnap.data() || null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  const birthdate = form.get("birthdate")?.toString();
  const country = form.get("country")?.toString();
  const region = form.get("region")?.toString();

  try {
    if (!birthdate || !country || !region)
      return { error: "Debes completar todos los campos" };

    const isOnLegalAge =
      differenceInYears(new Date(), new Date(birthdate)) >= 18;

    if (!isOnLegalAge)
      return { error: "Debes ser mayor de edad para registrarte" };

    try {
      const cookieHeader = request.headers.get("Cookie");
      const token = await userTokenCookie.parse(cookieHeader);

      const decodedToken = await adminAuth.verifyIdToken(token);

      await setDoc(
        doc(db, "users", decodedToken.uid),
        {
          birthdate,
          country,
          region,
        },
        { merge: true }
      );
    } catch (error) {
      return { error: "Algo salió mal, inténtalo más tarde" };
    }

    return redirect("/completar-registro/2");
  } catch (error: any) {
    return {
      error: "Ocurrió un error, vuelve a intentarlo más tarde",
    };
  }
};

export default function CompletarRegistro() {
  const [openCalendar, setOpenCalendar] = useState<boolean>(false);
  const [selected, setSelected] = useState<Date | undefined>();
  const [country, setCountry] = useState<string>("");
  const [region, setRegion] = useState<string>("");

  const defaultClassNames = getDefaultClassNames();

  const error = useActionData<ActionData>()?.error;

  const data = useLoaderData<LoaderData>();

  useEffect(() => {
    if (data.birthdate) setSelected(new Date(data.birthdate));
    if (data.country) setCountry(data.country);
    if (data.region) setRegion(data.region);
  }, []);

  return (
    <div className="overflow-auto max-h-screen w-2/3">
      <div className="h-2/3 flex flex-col justify-end gap-20 my-10">
        <div>
          <p className="font-extralight text-3xl">Paso 1</p>
          <p className="font-bold text-3xl">Perfil personal</p>
        </div>

        <Form
          method="post"
          className="min-h-[calc(50%+2rem)] flex flex-col pr-4"
        >
          <label htmlFor="birthdate" className="font-extralight mb-2">
            Fecha de nacimiento
          </label>

          {openCalendar ? (
            <DayPicker
              mode="single"
              required={false}
              captionLayout="dropdown"
              animate
              footer={
                selected ? `Elegiste ${selected.toLocaleDateString()}.` : ""
              }
              locale={es}
              onSelect={(date) => {
                setSelected(date);
                setOpenCalendar(false);
              }}
              endMonth={new Date()}
              selected={selected}
              className="capitalize"
              classNames={{
                today: `border-amber-500`,
                selected: `bg-amber-500 border-amber-500 text-white rounded-full`,
                root: `${defaultClassNames.root} border-2 w-fit rounded-xl p-3`,
                chevron: `fill-white`,
                footer: `text-xs mt-3 font-extralight pl-3`,
              }}
            />
          ) : (
            <input
              type="text"
              onClick={() => setOpenCalendar(true)}
              placeholder="Ej. 12 de abril de 1999"
              value={
                selected
                  ? selected.toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : ""
              }
              readOnly
              className="bg-transparent border-2 border-white rounded-xl h-12 pl-4 focus:outline-none cursor-pointer"
            />
          )}

          <input
            type="hidden"
            name="birthdate"
            value={selected ? selected.toDateString() : ""}
          />
          <p className="mb-4 mt-2 text-xs font-extralight">
            Solo para asegurarnos de que eres mayor de edad
          </p>

          <label htmlFor="country" className="font-extralight mb-2">
            País
          </label>
          <CountryDropdown
            name="country"
            value={country}
            onChange={setCountry}
            id="country"
            defaultOptionLabel="Ej. Colombia"
            className={`bg-transparent cursor-pointer mb-4 appearance-none border-2 border-white rounded-xl h-12 px-4 outline-none
                ${!country ? "text-gray-400" : "text-white"}`}
          />

          <label htmlFor="region" className="font-extralight mb-2">
            Región
          </label>
          <RegionDropdown
            name="region"
            country={country}
            value={region}
            onChange={(val) => setRegion(val)}
            defaultOptionLabel="Selecciona tu región"
            id="region"
            className={`bg-transparent cursor-pointer appearance-none border-2 border-white rounded-xl h-12 px-4 outline-none
                ${!region ? "text-gray-400" : "text-white"}`}
          />

          {error && (
            <p className="font-extralight text-orange-300 text-sm mt-3 w-[calc(100%-8rem)]">
              {error}
            </p>
          )}
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

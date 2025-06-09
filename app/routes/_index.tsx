import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Espora" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <main className="flex w-full bg-[linear-gradient(180deg,_#302B4F_0%,_#F46868_40%)]">
      <section className="w-[45%] h-screen p-6 relative">
        <img className="w-64" src="/logo-blanco.svg" alt="" />
        <img
          className="w-[80%] absolute bottom-0 right-0"
          src="/espora-icon-big.svg"
          alt=""
        />
      </section>
      <section className="text-white flex flex-col w-[65%] h-screen overflow-scroll pb-10">
        <nav className="flex justify-between mb-6 py-8 items-center">
          <div className="flex gap-4 font-light">
            <button className="text-[#868686]">Acerca de nosotros</button>
            <button className="text-[#868686]">Términos y condiciones</button>
            <button className="text-[#868686]">Contacto</button>
            <button className="text-[#868686]">Ayuda</button>
          </div>
          <div className="flex gap-4 pr-14">
            <Link to={"/registro"}>Registrarse</Link>
            <Link to={"/login"}>Iniciar sesión</Link>
          </div>
        </nav>
        <div className="h-full flex flex-col justify-center">
          <div className="flex flex-col items-center w-full">
            <p className="text-5xl font-bold w-2/3 text-center mb-8">
              ¡Te damos la bienvenida a Espora!
            </p>
            <p className="font-extralight text-center w-[80%] mb-8">
              Espora es un
              <span className="font-bold px-1">
                espacio digital hecho para artistas, gestores y amantes del arte
              </span>
              del Valle de Aburrá. Aquí no solo muestras tu trabajo: lo{" "}
              <span className="font-bold">
                compartes, colaboras y haces parte de una comunidad
              </span>{" "}
              viva que vibra con la creación.
            </p>
            <p className="text-5xl font-bold mb-6 text-center">
              ¿Qué puedes hacer en Espora?
            </p>
            <div className="flex w-full gap-6 justify-center mb-6">
              <div className="flex flex-col w-56 items-center gap-2">
                <img className="w-32 h-32" src="/art-icon.svg" alt="" />
                <p className="font-bold">Publica tu arte</p>
                <p className="text-center text-sm">
                  Sube tus obras, proyectos o eventos. ¡Todo cuenta!
                </p>
              </div>

              <div className="flex flex-col w-56 items-center gap-2">
                <img className="w-32 h-32" src="/conect-icon.svg" alt="" />
                <p className="font-bold">Conecta con otros artistas</p>
                <p className="text-center text-sm">
                  Encuentra creadores afines, haz red y colabora.
                </p>
              </div>

              <div className="flex flex-col w-56 items-center gap-2">
                <img className="w-32 h-32" src="/feedback-icon.svg" alt="" />
                <p className="font-bold">Recibe feedback real</p>
                <p className="text-center text-sm">
                  Tu arte merece ser visto y comentado
                </p>
              </div>
            </div>
            <Link
              to={"/inicio"}
              className="text-center p-3 font-bold text-white rounded-lg bg-[linear-gradient(to_left,_#DF6ABADB,_#B72EB2D6_35%)] mt-8 text-xl"
            >
              Ingresa a la comunidad
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

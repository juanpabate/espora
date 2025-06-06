import { NavLink, useNavigate, Link } from "@remix-run/react";
import { navItems, contacts } from "~/lib/constants";

type Data = {
  photoURL?: string;
  category?: string;
  name?: string;
  uid: string;
};

type NavProps = {
  data?: Data;
};

export default function Nav({ data }: NavProps) {
  const navigate = useNavigate();

  async function logout() {
    try {
      await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return navigate("/login");
    } catch (error) {
      return { error: error };
    }
  }
  return (
    <nav className="w-2/12 bg-[linear-gradient(180deg,_#F46868_25%,_#302B4F_100%)] overflow-scroll pb-3 text-sm">
      <div className="flex flex-col h-fit">
        <img src="/logo-blanco.svg" alt="" className="w-80 mt-4 p-4" />
        <div className="pr-10 pl-6">
          <div className="border-b-2 border-gray-400 flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <img
                src={data?.photoURL ? data?.photoURL : "/profile-photo.png"}
                alt="Foto de perfil"
                className="w-14 h-14 rounded-full"
              />
              <div>
                <p className="text-xs text-gray-200/40">
                  {data?.category ? data.category.toUpperCase() : "NN"}
                </p>
                <p className="text-sm">
                  {data?.name
                    ? data.name.split(" ").slice(0, 2).join(" ")
                    : "NN"}
                </p>
              </div>
            </div>
            <div className="w-full flex justify-center mb-4">
              <Link
                to={`/inicio/${data?.uid}`}
                className="flex items-center gap-2 p-1 px-2 rounded-md text-xs font-bold w-fitx"
              >
                <img src="/edit-icon.svg" alt="" className="w-3" />
                Editar perfil
              </Link>
            </div>
          </div>
        </div>
        <div className="pr-10 pl-6 mt-4 w-full flex flex-col gap-2">
          {navItems.map((nav) => (
            <NavLink
              className={({ isActive, isPending }) =>
                isPending
                  ? "bg-gray-300/50 rounded-md p-2 flex gap-4 items-center px-4"
                  : isActive
                  ? "bg-[#393939] rounded-md p-2 flex gap-4 items-center px-4"
                  : "bg-transparent rounded-md p-2 flex gap-4 items-center px-4 hover:bg-gray-300/50 transition-all"
              }
              to={nav.nav}
              key={nav.name}
            >
              <img src={nav.icon} alt="icon" />
              {nav.name}
            </NavLink>
          ))}
          <span className="border-b-2 border-gray-400 my-2 mb-8"></span>
        </div>
        <div className="px-6 w-full pr-10">
          <p className="flex w-full mb-6 gap-3">
            Ultimos mensajes
            <img src="/mas-icon.svg" alt="" />
          </p>
          <div className="flex flex-col gap-3 mb-10">
            {contacts.map((contact) => (
              <div className="flex items-center gap-3 text-sm cursor-pointer pl-3">
                <img
                  src={contact.img ? contact.img : "/profile-photo.png"}
                  alt=""
                  className="w-8"
                />
                <p>{contact.name}</p>
              </div>
            ))}
          </div>
        </div>
        <button
          className="flex gap-3 p-2 rounded-md bg-[#D961B8] hover:bg-[#e971c8] transition-all items-center font-bold ml-6 mr-10"
          onClick={logout}
        >
          <img src="/logout-icon.svg" alt="Cerrar sesión" />
          <p>Cerrar sesión</p>
        </button>
      </div>
    </nav>
  );
}

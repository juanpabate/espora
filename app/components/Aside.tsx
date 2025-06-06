import { FaSearch } from "react-icons/fa";
import { contacts } from "~/lib/constants";

export default function Aside() {
  return (
    <section className="w-2/12 flex flex-col items-center pt-8 bg-black">
      <div className="flex bg-[#404040] text-[#818181] rounded-lg items-center p-2 gap-2 mb-16">
        <FaSearch />
        <input
          type="text"
          className="bg-transparent w-full outline-none text-white placeholder:text-[#818181]"
          placeholder="Buscar"
        />
      </div>

      <div className="h-full border-l-[0.5px] border-white px-6 w-full">
        <p className="text-xl mb-4">Artistas sugeridos</p>

        <div className="flex flex-col gap-2 ">
          {contacts.map((contact) => (
            <div className="flex justify-between items-center">
              <div className="flex gap-2 text-xs items-center">
                <img className="w-6 h-6" src="/profile-photo.png" alt="" />
                <p>{contact.name}</p>
              </div>
              <button className="font-bold text-sm">Seguir</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

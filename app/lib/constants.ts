type NavItem = {
  name: string;
  nav: string;
  icon: string;
};

export const navItems: NavItem[] = [
  {
    name: "Inicio",
    nav: "/inicio",
    icon: "/inicio-icon.svg",
  },
  {
    name: "Mi Perfil",
    nav: "/mi-perfil",
    icon: "/profile-icon.svg",
  },
  {
    name: "Publicar",
    nav: "/publicar",
    icon: "/publicar-icon.svg",
  },
  {
    name: "Mi galería",
    nav: "/mi-galeria",
    icon: "/galeria-icon.svg",
  },
  {
    name: "Seguidos",
    nav: "/artistas-seguidos",
    icon: "/profile-icon.svg",
  },
  {
    name: "Mensajes",
    nav: "/mensajes",
    icon: "/mensajes-icon.svg",
  },
  {
    name: "Guardado",
    nav: "/guardado",
    icon: "/guardado-icon.svg",
  },
  {
    name: "Ajustes",
    nav: "/ajustes",
    icon: "/ajustes-icon.svg",
  },
];

export const categories = [
  "Música",
  "Ilustración",
  "Fotografía",
  "Escritura",
  "Arte escénico",
  "Diseño gráfico o visual",
  "Cine",
  "Escultura",
  "Arte plástico",
  "Artesanías",
  "Creaciones digitales",
];

export const fakePosts = [
  {
    userId: "sofia-ramirez",
    title: "Retratos de Medellín",
    description:
      "Una serie de retratos urbanos tomados en el centro de Medellín durante la hora dorada.",
    createdAt: "2025-06-01T08:00:00Z",
    imgs: [],
    likes: [],
    coments: [
      {
        userId: "carlos-duque",
        coment: "Qué manejo de luz tan brutal.",
        createdAt: "2025-06-01T09:00:00Z",
      },
      {
        userId: "valentina-jaramillo",
        coment: "Me encantó el de la señora en la calle Junín.",
        createdAt: "2025-06-01T09:30:00Z",
      },
    ],
  },
  {
    userId: "manuel-ortega",
    title: "Poema: Ciudad que duerme",
    description:
      "Un poema dedicado a los rincones silenciosos de una ciudad despierta.",
    createdAt: "2025-06-01T05:00:00Z",
    imgs: [],
    likes: [],
    coments: [
      {
        userId: "luisa-zapata",
        coment: "Sentí que caminaba por esas calles contigo.",
        createdAt: "2025-06-01T08:00:00Z",
      },
    ],
  },
  {
    userId: "juliana-gomez",
    title: "Personajes de un cuento",
    description:
      "Explorando el diseño de personajes para un cuento infantil sobre animales del Amazonas.",
    createdAt: "2025-05-31T10:00:00Z",
    imgs: [],
    likes: [],
    coments: [
      {
        userId: "andres-tabares",
        coment: "El jaguar está brutal. ¿Es digital o tradicional?",
        createdAt: "2025-05-31T14:00:00Z",
      },
    ],
  },
  {
    userId: "carlos-mejia",
    title: "Nueva canción: Amanecer",
    description:
      "Una canción inspirada en los sonidos del campo antioqueño. Ya disponible en SoundCloud.",
    createdAt: "2025-06-01T03:00:00Z",
    imgs: [],
    likes: [],
    coments: [
      {
        userId: "sara-ospina",
        coment: "Tiene una vibra muy tranquila, me gustó para empezar el día.",
        createdAt: "2025-06-01T06:00:00Z",
      },
    ],
  },
  {
    userId: "elena-castro",
    title: "Carteles para festival local",
    description:
      "Diseños conceptuales para el próximo festival cultural de Envigado.",
    createdAt: "2025-05-31T08:00:00Z",
    imgs: [],
    likes: [],
    coments: [
      {
        userId: "mateo-villegas",
        coment: "El contraste de colores está buenísimo.",
        createdAt: "2025-06-01T02:00:00Z",
      },
      {
        userId: "laura-arango",
        coment: "¿Dónde se puede conseguir una copia impresa?",
        createdAt: "2025-06-01T04:00:00Z",
      },
    ],
  },
  {
    userId: "tomas-rivas",
    title: "Corto experimental: 'Ruido blanco'",
    description: "Un ensayo visual sobre la ansiedad y el silencio digital.",
    createdAt: "2025-05-29T12:00:00Z",
    imgs: [],
    likes: [],
    coments: [
      {
        userId: "daniela-londono",
        coment: "Inquietante pero poderoso. Lo vi dos veces.",
        createdAt: "2025-05-30T12:00:00Z",
      },
    ],
  },
  {
    userId: "camila-perez",
    title: "Ensayo abierto: cuerpo en tránsito",
    description:
      "Imágenes del ensayo general de nuestra nueva obra de teatro físico.",
    createdAt: "2025-06-01T01:00:00Z",
    imgs: [],
    likes: [],
    coments: [
      {
        userId: "felipe-rios",
        coment: "Me encanta ver el proceso detrás de escena.",
        createdAt: "2025-06-01T04:00:00Z",
      },
    ],
  },
  {
    userId: "ricardo-morales",
    title: "Serie 'Fragmentos de ciudad'",
    description:
      "Esculturas hechas con materiales reciclados encontrados en el centro de Medellín.",
    createdAt: "2025-05-30T09:00:00Z",
    imgs: [],
    likes: [],
    coments: [
      {
        userId: "johana-esteban",
        coment: "El concepto está muy bien logrado, ¿dónde se exponen?",
        createdAt: "2025-05-31T09:00:00Z",
      },
    ],
  },
  {
    userId: "natalia-cano",
    title: "Tejidos ancestrales con hilo moderno",
    description:
      "Una colección de bolsos tejidos con patrones inspirados en la cultura zenú.",
    createdAt: "2025-06-01T00:00:00Z",
    imgs: [],
    likes: [],
    coments: [
      {
        userId: "melisa-herrera",
        coment: "¡Bellísimos! ¿Haces envíos?",
        createdAt: "2025-06-01T01:00:00Z",
      },
    ],
  },
  {
    userId: "david-luna",
    title: "Glitch art: exploraciones pixeladas",
    description:
      "Animaciones cortas que exploran errores digitales como forma de expresión.",
    createdAt: "2025-06-01T02:00:00Z",
    imgs: [],
    likes: [],
    coments: [
      {
        userId: "ana-maria-ochoa",
        coment: "Hipnótico. Me recordó a VHS antiguos.",
        createdAt: "2025-06-01T04:00:00Z",
      },
    ],
  },
];

type Contacts = {
  name: string;
  img?: string;
};

export const contacts: Contacts[] = [
  {
    name: "Pedro García",
  },
  {
    name: "Melisa Vélez",
  },
  {
    name: "Mariana Zapata",
  },
];

// Catálogo versionado de marca. Se carga también al abrir index.html directamente (sin fetch/backend).
(function(root){
  var K=root.KSA=root.KSA||{}, D=K.Designs={};
  D.version='2026-11-13';
  D.profiles=[
  {
    "id": "psg-experiences",
    "name": "PSG Experiences",
    "sections": [
      "psg-exp"
    ],
    "version": "2026-11-13",
    "header": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/2c5043ece01d4a9a8ae79d29943bad1a.png",
    "footer": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/1abe18827cfe4f5e9e62da2599c16442.png",
    "principal": "#004070",
    "acento": "#E30613",
    "secundario": "",
    "instructions": "- Azul #004070; rojo #E30613; cuerpo #444444; fondo suave #F5F7FB.\n- Fuentes PSG: regular 400, negrita cursiva 700 para etiquetas y 800 para titulares. Los alias PSG y Virage de los ejemplos apuntan a los mismos archivos; unificarlos internamente.\n- Principal 32/40 px sin forzar mayúsculas; franja azul con texto blanco; etiquetas pequeñas con espaciado y cursiva; cajas claras con borde lateral.\n- Agenda, tres datos clave, plazos, hotel con foto, galerías y actividades con precio se combinan según el contenido.\n- Las cinco referencias son válidas. Descartar el header alternativo de Extra Activities (8a7e3c25ddbb48239a929b9525a9d45a.png) como predeterminado.\n\n- Base de 650 px, márgenes interiores habituales de 40 px. Normalizar separaciones según la mayoría entre piezas equivalentes y verificar móvil.\n- Conservar textos, imágenes, enlaces y campos de cada envío. Ni precios, ni fechas, ni prestaciones de estos ejemplos son valores predeterminados del kit.",
    "banners": [
      {
        "name": "Paris Saint-Germain",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/748789e7f0084448873ba7dd5fc209b8.png"
      },
      {
        "name": "Paris Saint-Germain",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/06bf20224c974d91ab31fa32fd179ec8.png"
      },
      {
        "name": "Download Telegram on the App Store",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/f5a78b52cd43463f906f0b035c02d9a4.png?d=295"
      },
      {
        "name": "Get Telegram on Google Play",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/9684508779cc41e2bfcf82efebddf611.png?d=295"
      },
      {
        "name": "Paris Saint-Germain",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/2b4fc13269f44446a3e9eb1f4c8c0b7a.png?d=620"
      },
      {
        "name": "What to Bring – Paris Saint-Germain Academy Clinic",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/ea1ebe5da7d3450b9ebf9786ab254b71.png"
      },
      {
        "name": "PSG Academy Clinic check-in",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/db41930ca9e64891a5f0e1e09a535312.png"
      }
    ],
    "assets": [
      {
        "name": "Paris Saint-Germain",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/fcdfd108a5ad45938f89a0ea142a47d1.jpg"
      },
      {
        "name": "Renaissance Paris La Défense Hotel",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/542fef3f6c684586b25aba27ecd4d3a7.jpg"
      },
      {
        "name": "Airport transfers at Paris Charles de Gaulle",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/2791b74f31e04d22a12548731b00719b.jpg"
      },
      {
        "name": "Foto de actividad",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/fbb52f05bf1346eeab874899227faec6.jpg?d=580"
      },
      {
        "name": "Foto de actividad",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/4b01334c837847fab03d86737db7cc4b.jpg?d=580"
      }
    ]
  },
  {
    "id": "psg-camps",
    "name": "PSG Camps · USA y Canada",
    "sections": [
      "psg-usa",
      "psg-canada"
    ],
    "version": "2026-11-13",
    "header": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/2c5043ece01d4a9a8ae79d29943bad1a.png",
    "footer": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/c09d6bae9864490ca533ea605b59cb6d.png",
    "principal": "#004070",
    "acento": "#E20613",
    "secundario": "",
    "instructions": "PSG Camps USA/Canada: un único diseño compartido.\n- Azul #004070; cuerpo #444444; fondo suave #F5F7FB. Botones de Telegram rojos #E20613.\n- Mismos tres archivos de fuente PSG que Experiences; «PSG UltraBold» corresponde al peso 800.\n- Franja con asunto a la izquierda y PSG Summer Camps a la derecha; fichas compactas de datos; normas en paneles azules con texto blanco e iconos, y títulos internos en mayúsculas.\n- Banners de cuenta atrás, Telegram, QR y wallets son piezas opcionales. No fabricar banners para días sin imagen aportada.\n- USA y Canada usan exactamente este mismo kit por indicación del usuario; su contenido, ubicación e identificadores de sección siguen separados.\n\n- Base de 650 px, márgenes interiores habituales de 40 px. Normalizar separaciones según la mayoría entre piezas equivalentes y verificar móvil.\n- Conservar textos, imágenes, enlaces y campos de cada envío. Ni precios, ni fechas, ni prestaciones de estos ejemplos son valores predeterminados del kit.",
    "banners": [
      {
        "name": "100 Days To Go",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/dc7db3e9477b43e8a4addecb864e0b66.png"
      },
      {
        "name": "30 Days To Go",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/5fa34783955f44769403a6e3047d166a.png"
      },
      {
        "name": "Join our Telegram",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/7f493abaa134434b97195aec9af7961d.png"
      },
      {
        "name": "Download on the App Store",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/f5a78b52cd43463f906f0b035c02d9a4.png"
      },
      {
        "name": "Get it on Google Play",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/9684508779cc41e2bfcf82efebddf611.png"
      },
      {
        "name": "10 Days To Go",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/476b9f3c6aed4eae8d6bd2536752eee2.png"
      }
    ],
    "assets": [
      {
        "name": "Watch Telegram tutorial",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/32bfa22c932246f1a76efa984348317d.jpg"
      }
    ]
  },
  {
    "id": "arsenal-experiences",
    "name": "Arsenal Experiences",
    "sections": [
      "arsenal-exp"
    ],
    "version": "2026-11-13",
    "header": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/d0dda35e9eef4fc5bc22f768749c292a.png",
    "footer": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/e1baea18930047838d4054ffe1d0f262.png",
    "principal": "#B4001E",
    "acento": "#8B0015",
    "secundario": "#0C0C0C",
    "instructions": "- Rojo #B4001E; negro #0C0C0C; rojo oscuro #8B0015; fondo suave #FDF5F5; cuerpo #444444.\n- Titulares Georgia en negrita; cuerpo Helvetica/Arial. No añadir fuentes de PSG ni Extenda a esta marca.\n- Franja siempre roja, texto Helvetica/Arial 10/14 px en negrita con espaciado 1 px; titulares Georgia 32/40 px con espaciado -0.5 px; etiquetas/precios/bordes rojos, cajas rosadas claras. Normalizar jerarquía, tamaños y separaciones según los elementos equivalentes mayoritarios.\n- Agendas, plazos, hotel, galerías, fichas de actividades con foto lateral, fecha/hora/precio y paquetes media destacados son composiciones del mismo kit.\n- Usar header/footer comunes de cinco referencias. Sustituir como predeterminado la alternativa de las dos Premium, de acuerdo con la regla de mayoría confirmada.\n- Las dos Premium tienen contenido diferente: no fusionar prestaciones ni deducir alojamiento a partir del título.\n\n- Base de 650 px, márgenes interiores habituales de 40 px. Normalizar separaciones según la mayoría entre piezas equivalentes y verificar móvil.\n- Conservar textos, imágenes, enlaces y campos de cada envío. Ni precios, ni fechas, ni prestaciones de estos ejemplos son valores predeterminados del kit.",
    "banners": [
      {
        "name": "Arsenal Football Development",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/40cbff042a2d415f913ae196cefda354.png"
      },
      {
        "name": "Tentative schedule &ndash; Arsenal Football Development Clinic",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/files/42674b9bad7844c2a35dd209831fe964.png"
      },
      {
        "name": "Arsenal Football Development",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/4bc275fee15b4ef2b15d053da75f862c.png?d=620"
      },
      {
        "name": "Arsenal Football Development",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/abcbfecd26e544b28d063bc677e173ec.png?d=620"
      },
      {
        "name": "Arsenal Football Development",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/f5a78b52cd43463f906f0b035c02d9a4.png?d=295"
      },
      {
        "name": "Arsenal Football Development",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/9684508779cc41e2bfcf82efebddf611.png?d=295"
      },
      {
        "name": "Arsenal Football Development",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/ed8529dd792f4ab586522862bc7ee5f7.png?d=620"
      },
      {
        "name": "Arsenal Football Development",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/622fd2d1ffa24de5862ff73a50bc183f.png?d=620"
      },
      {
        "name": "Arsenal Football Development",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/d1ff9afd2aa347939cc9ad3ed977e414.png?d=620"
      },
      {
        "name": "Arsenal Football Development",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/d956203cb76e48d4937afad70d8069c1.png?d=620"
      },
      {
        "name": "Arsenal Football Development",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/files/7af882e9e0bf4b4ebfd4fd0610a55275.png"
      }
    ],
    "assets": [
      {
        "name": "Arsenal Football Development",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/edfcf80424ac4815926d99b74f90e1c0.jpg"
      },
      {
        "name": "Arsenal Football Development",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/f168d588c1ef4f65a247343705029a73.jpg"
      },
      {
        "name": "Tower of London",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/32514b6d44904d17a1eb1060c8fc8b69.jpeg"
      },
      {
        "name": "Royal Palaces",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/e5e2c3d428b040328fcc08fe4ebb443e.jpg"
      },
      {
        "name": "Harry Potter &ndash; Warner Bros. Studio",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/ca3cd33c6f4c433bb4be514d941ec4c6.jpg"
      },
      {
        "name": "Windsor Castle",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/f688444020e34a0193cc5abf19b32668.jpeg"
      },
      {
        "name": "Hilton London Metropole hotel",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/2a40526414d44f3986841d4aff387aee.jpg?d=295"
      }
    ]
  },
  {
    "id": "arsenal-camps",
    "name": "Arsenal Camps · USA y Canada",
    "sections": [
      "arsenal-usa",
      "arsenal-canada"
    ],
    "version": "2026-11-13",
    "header": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/d0dda35e9eef4fc5bc22f768749c292a.png",
    "footer": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/98f6f8c33f6d4fedb45231509e6f0fc5.png",
    "principal": "#B4001E",
    "acento": "#8B0015",
    "secundario": "#0C0C0C",
    "instructions": "- Rojo #B4001E; negro #0C0C0C; rojo oscuro #8B0015; fondo suave #FDF5F5; cuerpo #444444.\n- Titulares Georgia en negrita y texto Helvetica/Arial, sin fuentes externas.\n- Franja negra con asunto y Arsenal Summer Camp. Fichas compactas de datos y servicios/precios; normas sobre fondo rojo con texto/títulos/iconos blancos.\n- Header presente en doce referencias; footer en once: son los predeterminados de este kit.\n- Cuenta atrás, Telegram, certificado regalo, QR, wallets y calendario se añaden solo según el contenido.\n- USA y Canada comparten kit por confirmación expresa. El mensaje OnArrival es para personal y no se convierte en una receta de familias ni aporta enlaces predeterminados a otros envíos.\n\n- Base de 650 px, márgenes interiores habituales de 40 px. Normalizar separaciones según la mayoría entre piezas equivalentes y verificar móvil.\n- Conservar textos, imágenes, enlaces y campos de cada envío. Ni precios, ni fechas, ni prestaciones de estos ejemplos son valores predeterminados del kit.",
    "banners": [
      {
        "name": "100 Days To Go",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/51e551785c72483193514e2c89a4cd49.png"
      },
      {
        "name": "50 Days To Go",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/c81d207ab30a4562b68d4be715f1eb00.png"
      },
      {
        "name": "30 Days To Go",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/153ae71e83ca4edea345b5c06f482bb0.png"
      },
      {
        "name": "10 Days To Go",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/0b02407b1ef04633a70e6b31271591fa.png"
      },
      {
        "name": "Join our Telegram",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/18fc2c3ce3da46ad9ef3769761bc4775.png"
      },
      {
        "name": "Download on the App Store",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/f5a78b52cd43463f906f0b035c02d9a4.png"
      },
      {
        "name": "Get it on Google Play",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/9684508779cc41e2bfcf82efebddf611.png"
      }
    ],
    "assets": [
      {
        "name": "Watch Telegram tutorial",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/32bfa22c932246f1a76efa984348317d.jpg"
      }
    ]
  },
  {
    "id": "rmf-experiences",
    "name": "Real Madrid Foundation Experiences",
    "sections": [
      "rmf-exp"
    ],
    "version": "2026-11-13",
    "header": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/0680e31902b84ed88b7a08dcaa246d83.png",
    "footer": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/6ca9b3ea03a54f20b3e76a29e1bbb500.png",
    "principal": "#1A1D4F",
    "acento": "#BF873C",
    "secundario": "",
    "instructions": "- Azul #1A1D4F; dorado #BF873C; cuerpo #444444; fondo suave #F6F5F0.\n- Principal Georgia negrita 32/40 px; cuerpo Helvetica/Arial; sin fuentes externas.\n- Franja azul y detalles dorados; cajas claras con borde lateral; agenda con fecha oscura, texto blanco y etiqueta dorada.\n- Normalizar las variantes minoritarias de Schedule & Extra Activities al patrón anterior; preservar sus fichas de actividades y contenido.\n- Essential, Premium y All-In son paquetes con prestaciones distintas dentro de este mismo kit. No crear estilos adicionales para cada paquete ni unificar sus textos.\n- Header indicado expresamente por el usuario; descartar la alternativa 5b29266273624b748ebbcf23af298a1f.png?d=650 como predeterminado. Footer sin parámetro como predeterminado mayoritario.\n- QR Telegram y QR de participante son piezas diferentes. RMF World Challenge queda fuera de este kit.\n\n- Base de 650 px, márgenes interiores habituales de 40 px. Normalizar separaciones según la mayoría entre piezas equivalentes y verificar móvil.\n- Conservar textos, imágenes, enlaces y campos de cada envío. Ni precios, ni fechas, ni prestaciones de estos ejemplos son valores predeterminados del kit.",
    "banners": [
      {
        "name": "Real Madrid Foundation",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/d63cb84c330346ae9019b60c34e2c1e6.png?d=620"
      },
      {
        "name": "Tentative Schedule - RMF Clinic November 2026 - All-In Pack",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/3ec547bace83473799db32c509683eb9.png"
      },
      {
        "name": "Real Madrid Foundation",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/74efa03a83c94932a7e65d6e9bb69772.png?d=620"
      },
      {
        "name": "Download on the App Store",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/f5a78b52cd43463f906f0b035c02d9a4.png?d=295"
      },
      {
        "name": "Get it on Google Play",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/9684508779cc41e2bfcf82efebddf611.png?d=295"
      },
      {
        "name": "QR Code - Join RMF Clinic Channel on Telegram",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/17a152f861694e10bc6676066dd79000.png"
      },
      {
        "name": "Tentative Schedule - RMF Clinic November 2026 - Essential Pack",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/653572d4f6a14fa4af322af0b6c49818.png"
      },
      {
        "name": "Tentative Schedule",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/af85f2faec87458a84fab767dafe83f0.png?d=620"
      },
      {
        "name": "Toledo Day Trip",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/62c693d2846545288c63cb2642e653c2.png?d=295"
      },
      {
        "name": "Segovia Day Trip",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/d2a52cd7dd86497da51582c69d9787a3.png?d=295"
      },
      {
        "name": "Real Madrid Foundation",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/6ca9b3ea03a54f20b3e76a29e1bbb500.png?d=620"
      },
      {
        "name": "Real Madrid Foundation",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/0a973473733c422fa4c0128724eaa51e.png?d=620"
      },
      {
        "name": "Real Madrid Foundation",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/f78126c02b9a4af6991ac47850f1cbdc.png?d=295"
      },
      {
        "name": "Real Madrid Foundation",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/89f60942dfd24963a0b3ee94c335eee3.png?d=620"
      },
      {
        "name": "Tentative Schedule - RMF Clinic November 2026 - Premium Pack",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/725b1ad1f13f4d44aa492f564b8db1a8.png"
      }
    ],
    "assets": [
      {
        "name": "Real Madrid Foundation",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/729ff54314b74bffa89ad676a8cf8834.jpg"
      },
      {
        "name": "Real Madrid Foundation",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/3669708d524d4690a6bfd31af4b9846d.jpg"
      },
      {
        "name": "Real Madrid Foundation",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/60ef874c2b5c468d9cfb9d354862d38b.jpg"
      },
      {
        "name": "Real Madrid Foundation",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/850c2bbf69114829b89eb38589bea447.jpg?d=295"
      },
      {
        "name": "Santiago Bernab&eacute;u Stadium Tour",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/2f16f0f686984829b8fa652a7fc661d6.jpg?d=295"
      }
    ]
  },
  {
    "id": "rmf-camps",
    "name": "Real Madrid Foundation Camps · USA y Canada",
    "sections": [
      "rmf-usa",
      "rmf-canada"
    ],
    "version": "2026-11-13",
    "header": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/0680e31902b84ed88b7a08dcaa246d83.png",
    "footer": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/db9333ea4c694dcd954c90570f8d30f4.png",
    "principal": "#1A1D4F",
    "acento": "#BF873C",
    "secundario": "",
    "instructions": "- Azul #1A1D4F; dorado #BF873C; cuerpo #2D2F30; fondo suave #F5F7FA.\n- Principal Georgia negrita 28/36 px; cuerpo Helvetica/Arial, sin fuentes externas. Conservar la jerarquía más compacta respecto a Experiences.\n- Franja azul con etiqueta dorada y Summer Camps; fichas de datos, opciones/precios y paquete destacado. Normas con iconos en tarjetas (dos columnas en escritorio, apiladas en móvil).\n- Header en los trece adjuntos; footer See You At Camp en doce. Aplicar ambos como predeterminados.\n- Cuenta atrás, Telegram, regalo, QR, wallets, OnArrival y calendario son piezas opcionales según el propósito del envío.\n- USA y Canada comparten kit por confirmación expresa. Camp Cancellation y Cancellation Confirmation tienen propósitos y textos diferentes; no fusionarlos como contenido.\n- No extender estas reglas a RMF World Challenge.\n\n- Base de 650 px, márgenes interiores habituales de 40 px. Normalizar separaciones según la mayoría entre piezas equivalentes y verificar móvil.\n- Conservar textos, imágenes, enlaces y campos de cada envío. Ni precios, ni fechas, ni prestaciones de estos ejemplos son valores predeterminados del kit.",
    "banners": [
      {
        "name": "Real Madrid Foundation Soccer Camp",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/19e2ceda816e4b79857beb8b84850b35.png"
      },
      {
        "name": "50 days until camp begins",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/f16b13de66854f04ad056c02bc5abe8a.png"
      },
      {
        "name": "30 days until camp begins",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/fdcefaec2d344e7eadea145f0641030f.png"
      },
      {
        "name": "Watch the instructional video",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/546ec30a6b724c21a63a7b4c3a1f5e85.png"
      },
      {
        "name": "Communication during the camp",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/09f924a9204d49ea9751f618eff1c6ff.png"
      },
      {
        "name": "Telegram Communications",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/c3e0e347c5744e28b72d001bfbb3d8ff.png"
      }
    ],
    "assets": [
      {
        "name": "Download on the App Store",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/027be8d898584eb5bf735d651829f937.jpeg"
      },
      {
        "name": "Get it on Google Play",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/2fa30f076e9a41748f592c0de3a143eb.jpeg"
      }
    ]
  },
  {
    "id": "rmf-wch",
    "name": "RMF World Challenge 2027",
    "sections": [
      "rmf-wc"
    ],
    "version": "2026-11-13",
    "header": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/df32a86304cb472599c44c9e4979cf33.png",
    "footer": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/c2955fb129e34300b1277fc35ad7e793.png",
    "principal": "#BEA47A",
    "acento": "#BEA47A",
    "secundario": "",
    "instructions": "- Predominan el BLANCO y el DORADO.\n- Negro y carbón solo para texto y detalles.\n- Nunca rojo ni colores fuera de esta paleta.\n\n## 2. COLORES\n#FFFFFF  Blanco · fondo del email y del contenido, texto sobre carbón\n#bea47a  Dorado · barras, bordes, bullets, etiquetas de fecha, botón dorado (fondo y borde), títulos pequeños (eyebrows/labels)\n#F8F5EF  Dorado suave · fondo de cajas, timeline y contacto\n#EAE5DA  Líneas divisorias y bordes suaves\n#000000  Negro · H1, títulos, negritas, texto del botón dorado\n#1F1F1F  Carbón · subheader, tarjetas oscuras, timeline, botón oscuro, aviso \"Important\"\n#2B2B2B  Texto cuerpo\n#6B6B6B  Notas y labels de datos\n#9A9A9A  Footer legal\n\n## 3. CÓMO RESALTAR (en lugar de rojo)\n- Fechas límite / datos clave → etiqueta dorada: fondo #bea47a + texto negro en negrita.\n- Palabras urgentes → negrita negra + subrayado dorado (border-bottom: 2px solid #bea47a).\n- Avisos importantes → caja carbón #1F1F1F, texto blanco y etiqueta \"IMPORTANT\" en dorado.\n- Títulos pequeños (Step, Good to know, labels) → siempre en dorado #bea47a, mayúsculas.\n\n## 4. TIPOGRAFÍA\nTitulares, cifras y fechas → Georgia, serif\nCuerpo, labels, botones y footer → Helvetica, Arial, sans-serif\n(Sin fuentes web)\n\nH1 ................ Georgia 32/40px · bold · negro · barra dorada debajo 56×4px\nH2 de sección ..... Georgia 22/28px · bold · negro · centrado · barra dorada 40×3px\nTítulo de caja .... Georgia 20/26px · bold · negro\nFecha deadline .... Georgia 19/24px · bold · negro\nIntro ............. Helvetica 15/25px · #2B2B2B\nCuerpo/bullets .... Helvetica 14/22px · #2B2B2B\nNotas ............. Helvetica 13/21px · #2B2B2B\nEyebrow/labels .... Helvetica 10–11px · bold · mayúsculas · espaciado 2px · dorado\nSubheader ......... Helvetica 11px · bold · mayúsculas · blanco\nBotón ............. Helvetica 11/15px · bold · mayúsculas · espaciado 1.5px\nFooter ............ Helvetica 10/13px · #9A9A9A\n\nBullet estándar: punto (•) en dorado #bea47a.\n\n## 5. IMÁGENES (links de Cvent)\nHeader WCH (siempre arriba):\nhttps://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/df32a86304cb472599c44c9e4979cf33.png\n\nBanner \"See You in Madrid\" (siempre antes del footer):\nhttps://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/c2955fb129e34300b1277fc35ad7e793.png\n\nFoto World Challenge (foto a sangre):\nhttps://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/a13a3c67f33046eb8dc29f11262c117f.jpg?d=650\n\nApple Wallet (badge):\nhttps://www.cvent-assets.com/event-email-editor/assets/images/US-UK_Add_to_Apple_Wallet_RGB_101421__d018a8bb15e6d1b46780.png\n\nGoogle Wallet (badge):\nhttps://www.cvent-assets.com/event-email-editor/assets/images/enUS_add_to_google_wallet_add-wallet-badge__b79d999246ba9434bcd9.png\n\nYa NO se usan:\n- Hero \"Welcome to the Challenge\" (d4485b5c…png)\n- Banner inferior RMF antiguo (9082f8f3…png)\n\nReglas de imágenes:\n- Solo custom links de Cvent. Nunca base64, Drive, Dropbox ni otras webs.\n- Imágenes a ancho completo: 650px.\n- Para subir imágenes nuevas: 1200px de ancho (retina), JPG ~80% de calidad.\n- Si falta un link: dejar [PENDIENTE: custom link Cvent — nombre de la imagen].\n- Alt habitual: \"Real Madrid Foundation World Challenge\".\n\n## 6. ELEMENTOS FIJOS (en todas las newsletters)\n## 1. Header WCH\n## 2. Subheader: franja carbón #1F1F1F\n   Izquierda: WORLD CHALLENGE 2027 (blanco)\n   Derecha: FUNDACIÓN REAL MADRID (blanco)\n## 3. … contenido …\n## 4. Contacto + firma (fondo #F8F5EF)\n## 5. Banner \"See You in Madrid\"\n## 6. Footer: solo la línea de baja (unsubscribe)\n\n## 7. COMPONENTES\n- Caja \"Step\": fondo #F8F5EF + borde izquierdo dorado 4px + etiqueta dorada de deadline.\n- Caja info: fondo #F8F5EF + borde izquierdo dorado 4px + título Georgia 20px.\n- Tarjetas \"At a glance\": 3 de 180px (2 carbón + 1 blanca con borde dorado), esquinas 8px.\n- Timeline: columna carbón de 120px + cuerpo #F8F5EF.\n- Deadlines: 2 cajas de 285px con borde dorado 2px.\n- Tres fotos: 182px cada una, esquinas 6px.\n- CTA: caja blanca con borde dorado 2px + enlace de Cvent.\n- Botón dorado: 190px · fondo y borde #bea47a · texto negro en mayúsculas · esquinas 4px.\n- Botón carbón: 190px · fondo #1F1F1F · texto blanco.\n- Aviso \"Important\": caja carbón · etiqueta dorada · texto blanco.\n\n## 8. MEDIDAS Y REGLAS TÉCNICAS\n- Ancho del email: 650px. Márgenes laterales del contenido: 40px (20px en móvil).\n- Estructura en tablas y CSS inline (sin div, flexbox ni grid).\n- Códigos de compatibilidad con Outlook en cada sección.\n- Fondo del email: blanco.\n- Nunca envolver filas con <span> o <div>.\n- No usar min-height; para igualar alturas, height fijo.\n- Entregar siempre .html (vista previa) + .txt (para pegar en Cvent).\n\n## 9. TAGS DE CVENT (no modificar nunca)\n{[C-FIRST NAME:TC]} ............ Nombre\n{[C-LAST NAME]} ................ Apellido\n{[C-EMAIL]} / {[C-CONFIRMATION NUM]}\n{[E-TITLE]} .................... Nombre del evento\n{[E-START DATE:WCMMSD1C4]} / {[E-END DATE:WCMMSD1C4]}\n{[E-START TIME:UA]} / {[E-END TIME:UA]} / {[E-TIME ZONE]}\n{[E-ADDRESS]} .................. Dirección\n{[E-CUSTOM:Event Phone Number]}  Teléfono\n{[C-PAYMENTS]} ................. Pagos\n{[C-QRCODE_LINK]} .............. QR\n{[C-PASSBOOK_LINK]} / {[C-GOOGLEWALLET_LINK]} .. Wallets\n{[E-RSVP YES LINK]} ............ Inscripción (genera su propio enlace)\n{[E-MODIFY REG LINK]} .......... Modificar registro (genera su propio enlace)\n{[P-FIRST NAME]} {[P-LAST NAME]}  Firma\n{[EMAIL OPT OUT]} .............. Baja\n\nImportante: {[E-RSVP YES LINK]} y {[E-MODIFY REG LINK]} nunca van dentro de otro enlace.\n\n## 10. IDIOMA Y TONO\n- Copy de las newsletters: inglés.\n- Tono: cercano y premium. En los recordatorios, urgente pero educado.",
    "banners": [],
    "assets": [
      {
        "name": "Foto World Challenge (a sangre)",
        "url": "https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/a13a3c67f33046eb8dc29f11262c117f.jpg?d=650"
      }
    ]
  }
];
  D.profiles.forEach(function(p){if(p.id.indexOf('arsenal')===0)p.instructions+='\n- Regla Arsenal: franja roja con texto blanco, Helvetica/Arial 10/14 px en negrita y letter-spacing 1 px. Titular Georgia 32/40 px con letter-spacing -0.5 px. Esta regla sustituye cualquier indicación anterior de franja negra.';});
  function copy(x){return JSON.parse(JSON.stringify(x));}
  D.get=function(id){return copy(D.profiles.filter(function(p){return p.id===id;})[0]||null);};
  D.forSection=function(tid){return copy(D.profiles.filter(function(p){return p.sections.indexOf(tid)>=0;})[0]||null);};
  D.canonical=function(tid){var p=D.forSection(tid);return p?p.sections[0]:tid;};
  D.active=function(st){return !!(st && ((st.designVersion===D.version && D.forSection(st.tournament)) || (st.brandKit&&st.brandKit.designId))); };
  D.theme=function(p,kit){
    var c=(kit&&kit.colors)||{principal:p.principal,acento:p.acento}, a=c.principal,b=c.acento;
    var ars=p.id.indexOf('arsenal')===0, rmf=p.id.indexOf('rmf')===0, wch=p.id==='rmf-wch', camp=/camps$/.test(p.id);
    // Franja identificadora copiada de las referencias de cada kit (docs/brand-kits/referencias): padding 12/40, sin barra inferior.
    // font: bold / reg (las fuentes del kit por función; en PSG la negrita es PSG Bold Italic), regbold (la regular en negrita:
    // en PSG Camps la referencia pide PSG bold sin cursiva y el navegador engrosa la regular, recta) o serif (Georgia negrita).
    var FR={
      'psg-experiences':{bg:a,l:{font:'bold',size:'11px',color:'#FFFFFF',tracking:'3px',italic:true},r:{font:'reg',size:'11px',color:'#FFFFFF',tracking:'1px'}},
      'psg-camps':{bg:a,nowrap:true,l:{font:'regbold',size:'10px',color:'#FFFFFF',tracking:'1px'},r:{font:'reg',size:'10px',color:'#C9D8E8',tracking:'1px'}},
      'rmf-experiences':{bg:'#13163B',l:{font:'bold',size:'11px',color:'#FFFFFF',tracking:'1px'},r:{font:'reg',size:'11px',color:b,tracking:'1px'}},
      // WCH: como sus dos emails de ejemplo (referencias/rmf-wch/01 y 02): carbón, Helvetica 11/16 px negrita, blanca, espaciado
      // 1 px, sin cortes de línea; en móvil 9 px sin espaciado (clase mobile-sub, como el ejemplo 02).
      'rmf-wch':{bg:'#1F1F1F',lh:'16px',keepAll:true,mobileSub:true,l:{font:'bold',size:'11px',color:'#FFFFFF',tracking:'1px'},r:{font:'bold',size:'11px',color:'#FFFFFF',tracking:'1px'}},
      'rmf-camps':{bg:'#13163B',l:{font:'serif',size:'11px',color:b,tracking:'3px'},r:{font:'reg',size:'11px',color:'rgba(255,255,255,0.8)',tracking:'1px'}}
    }[p.id]||null;
    if(wch)return {franja:FR,label:a,edge:a,titleBar:a,title:'#000000',strong:'#000000',link:'#000000',button:a,buttonText:'#000000',franjaText:'#FFFFFF',franjaBg:'#1F1F1F',line:'#EAE5DA',contactBg:'#F8F5EF',band:'#1F1F1F',body:'#2B2B2B',grey:'#9A9A9A',soft:'#F8F5EF',bg:'#FFFFFF',titleCase:'none',headWeight:'bold',btnRadius:'4px',onDark:a,hilite:a,franjaBar:'#1F1F1F',h1:'32px;line-height:40px',h2:'22px;line-height:28px'};
    return {franja:FR,label:rmf?b:a,edge:rmf?b:a,titleBar:rmf?b:a,title:ars?'#0C0C0C':a,strong:ars?'#0C0C0C':a,link:a,button:ars?a:rmf?b:b,buttonText:rmf?'#000000':'#FFFFFF',franjaText:'#FFFFFF',franjaBg:ars?'#B4001E':a,franjaBar:ars?'#B4001E':a,franjaTracking:ars?'1px':null,franjaSize:ars?'10px':null,titleTracking:ars?'-0.5px':'0.3px',line:rmf?'#EAE5DA':'#EEEEEE',contactBg:ars?'#FDF5F5':rmf?(camp?'#F5F7FA':'#F6F5F0'):'#F5F7FB',band:a,body:rmf&&camp?'#2D2F30':'#444444',grey:'#AAAAAA',soft:ars?'#FDF5F5':rmf?(camp?'#F5F7FA':'#F6F5F0'):'#F5F7FB',bg:'#FFFFFF',titleCase:'none',headWeight:'bold',btnRadius:'4px',onDark:ars?'#FFCCCC':rmf?b:'#FFFFFF',hilite:ars?a:b,h1:rmf&&camp?'28px;line-height:36px':'32px;line-height:40px',h2:'22px;line-height:28px'};
  };
  D.instructions=function(tid){var p=D.forSection(tid);return p?'BRAND KIT '+p.name+' · '+p.version+'\n'+p.instructions:'';};
})(typeof window!=='undefined'?window:globalThis);

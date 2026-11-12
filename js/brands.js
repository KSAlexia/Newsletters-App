// ============================================================
// FICHAS DE CLIENTE (brand kits)
// Para añadir un torneo: copia un bloque y cambia sus datos.
// footer: null  →  footer de imagen PENDIENTE (la app no lo inventa).
// ============================================================
(function (root) {
  var K = root.KSA = root.KSA || {};
  var PIX = 'https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/';

  K.CLIENT = {
    id: 'ksags',
    name: 'Kaptiva Global Stage',
    filePrefix: 'ksags',
    imageBase: 'https://custom.cvent.com/',
    contactEmail: 'globalmedia@kaptivasports.com',
    mediaBanner: PIX + '1417e53fed184a539904a7d3d799eca1.png',
    tournaments: [
      { id: 'surfcup', slug: 'surfcup', name: 'Surf Cup 2026', short: 'Surf Cup',
        principal: '#6F4ACC', acento: '#91FAFB', secundario: null,
        header: PIX + '40eb51f5da2f42db912ba6804522e102.png',
        footer: PIX + '15c6e3e7d343442eaf7f0df323da0259.png', footerAlt: 'See you in Barcelona' },
      { id: 'fit', slug: 'fit', name: 'FIT Tournament 2027', short: 'FIT Tournament',
        principal: '#48237E', acento: '#EE77EA', secundario: '#6F4ACC',
        header: PIX + '62e97cbfba2e4c4bb0042529aa957cab.png',
        footer: PIX + '15c6e3e7d343442eaf7f0df323da0259.png', footerAlt: 'See you in Barcelona' },
      { id: 'endeka', slug: 'endeka', name: 'Endeka Sports Cup 2027', short: 'Endeka',
        principal: '#48237E', acento: '#FFF95E', secundario: '#6F4ACC',
        header: PIX + '2e9812805a234aefa25b6801fe875397.png',
        footer: null, footerAlt: '' },
      { id: 'mic', slug: 'mic-puntacana', name: 'MIC Punta Cana 2027', short: 'MIC Punta Cana',
        principal: '#6F4ACC', acento: '#BAC7FF', secundario: '#48237E',
        header: PIX + '36bba1a5029145198fdddd3202d0766b.png',
        footer: null, footerAlt: '' },
      { id: 'usacup', slug: 'usacup', name: 'USA Cup 2027', short: 'USA Cup',
        principal: '#6F4ACC', acento: '#D3FC72', secundario: '#48237E',
        header: PIX + 'a733d40a589949edb8fc730d12185797.png',
        footer: PIX + '800d74d8d4b4424cb1dca013d4c0efb3.png', footerAlt: 'USA Cup 2027' }
    ]
  };

  // ============================================================
  // CLUBS: cada club tiene secciones fijas. Una sección hereda el diseño del club
  // y puede cambiar header, footer, colores, fuentes, nombre o contacto.
  // null / '' → PENDIENTE (la app no lo inventa y la revisión avisa).
  // fonts: custom links por uso; sin «fonts» se usan las fuentes de KSA.
  // families: fuentes de sistema por uso (sin enlace), p. ej. Georgia.
  // contact: email o custom field de Cvent para la caja «Get in Touch».
  // ============================================================
  var PSG_FONTS = (function () {
    var F = 'https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/files/', regular = F + '2d7daec633b4437d99ea6d638c5bc5a8.ttf', boldItalic = F + '6d0ea52a58b145fe9b8c2077cddba5d6.otf', ultra = F + 'f7af6f3c0aeb49dd880cd60fe6a07804.otf';
    return { Extenda60: ultra, Extenda40: ultra, DinProBlack: ultra, DinProBold: boldItalic, DinProMedium: regular, DinProLight: regular, DinProRegular: regular };
  })();
  var SERIF = "Georgia, 'Times New Roman', Times, serif", SANS = 'Helvetica, Arial, sans-serif';
  // Bayern: Cond Extra Bold para titulares y cifras, Bold para negrita, Regular para el resto (asignación propuesta).
  var BAYERN_FONTS = (function () {
    var F = 'https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/files/', regular = F + '61fcb5a326e24f048a37611e055efe23.otf', bold = F + '70e748e21b7f42568b717d1c87840f36.otf', cond = F + 'a55077d0af444071a9c0e2c8455ac498.otf';
    return { Extenda60: cond, Extenda40: cond, DinProBlack: cond, DinProBold: bold, DinProMedium: regular, DinProLight: regular, DinProRegular: regular };
  })();
  // Kaptiva Sports Academy: familia DinPro propia (cada peso a su uso) y Flatory Serif Condensed para titulares
  // (ExtraBold en los principales, Condensed en los secundarios; asignación propuesta).
  var ACADEMY_FONTS = (function () {
    var F = 'https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/files/';
    return { Extenda60: F + '4f15fb5051684e46873120016ed52f5a.ttf', Extenda40: F + '58e02325010142979d530067c131782c.ttf',
      DinProBlack: F + 'c099737cde124464b993fa156de6e130.otf', DinProBold: F + '27c4c40d384149a19e63377ba9b3b981.otf',
      DinProMedium: F + '28392b958c97456fae011c4b5e4ef28c.otf', DinProRegular: F + '7cb43dc39f724cef98c04200c9e1bccf.otf', DinProLight: F + '8ee7cfe4f92440f99df5a47fdee34944.otf' };
  })();
  K.CLIENT.clubs = [
    { id: 'rmf', name: 'Fundación Real Madrid', filePrefix: 'rmf',
      base: { brand: 'Real Madrid Foundation', principal: '#1A1D4F', acento: '#BF873C', secundario: null, header: PIX + '0680e31902b84ed88b7a08dcaa246d83.png', contact: '' },
      sections: [
        { id: 'rmf-usa', section: 'USA CAMPS', footer: PIX + 'db9333ea4c694dcd954c90570f8d30f4.png', footerAlt: 'See You At Camp' },
        { id: 'rmf-canada', section: 'CANADA CAMPS', footer: PIX + 'db9333ea4c694dcd954c90570f8d30f4.png', footerAlt: 'See You At Camp' },
        { id: 'rmf-exp', section: 'EXPERIENCES', footer: PIX + '6ca9b3ea03a54f20b3e76a29e1bbb500.png', footerAlt: 'Real Madrid Foundation' },
        // Diseño propio todavía no recibido: header y footer pendientes, colores del club como provisionales.
        { id: 'rmf-wc', section: 'RMF WORLD CHALLENGE', header: null, footer: null, footerAlt: '', provisional: true }
      ] },
    { id: 'psg', name: 'Paris Saint-Germain Academy', filePrefix: 'psg',
      base: { brand: 'Paris Saint-Germain', principal: '#004070', acento: '#E30613', secundario: null, header: PIX + '2c5043ece01d4a9a8ae79d29943bad1a.png', footer: PIX + '1abe18827cfe4f5e9e62da2599c16442.png', footerAlt: 'Paris Saint-Germain', fonts: PSG_FONTS, contact: '' },
      sections: [{ id: 'psg-usa', section: 'USA CAMPS' }, { id: 'psg-canada', section: 'CANADA CAMPS' }, { id: 'psg-exp', section: 'EXPERIENCES' }] },
    { id: 'arsenal', name: 'Arsenal', filePrefix: 'arsenal',
      base: { brand: 'Arsenal Summer Camp', principal: '#B4001E', acento: '#8B0015', secundario: '#0C0C0C', header: PIX + 'd0dda35e9eef4fc5bc22f768749c292a.png', footer: PIX + '98f6f8c33f6d4fedb45231509e6f0fc5.png', footerAlt: 'Arsenal Football Development', fonts: {},
        families: { Extenda60: SERIF, Extenda40: SERIF, DinProBlack: SERIF, DinProBold: SANS, DinProMedium: SANS, DinProLight: SANS, DinProRegular: SANS }, contact: '' },
      sections: [
        { id: 'arsenal-usa', section: 'USA CAMPS' }, { id: 'arsenal-canada', section: 'CANADA CAMPS' },
        { id: 'arsenal-exp', section: 'EXPERIENCES', brand: 'Arsenal Football Development Clinic', footer: PIX + 'e1baea18930047838d4054ffe1d0f262.png' }
      ] },
    { id: 'bayern', name: 'Bayern FC', filePrefix: 'bayern',
      base: { brand: 'FC Bayern Soccer Camp', principal: '#ED0037', acento: '#286CFC', secundario: null, header: PIX + '020025ab69804500ac546ae96b2ffdf4.png', footer: PIX + 'e1222579c3d6493381c01e340d4b6ef1.jpg', footerAlt: 'See you in Munich', fonts: BAYERN_FONTS, contact: 'experience@fcbayernsoccercamps.com' },
      sections: [{ id: 'bayern-canada', section: 'CANADA CAMPS' }, { id: 'bayern-exp', section: 'EXPERIENCES' }] }
  ];
  // Kaptiva Sports Academy: va en su propio grupo del hub y sus secciones se listan directamente (flat).
  K.CLIENT.clubs.push({ id: 'academy', name: 'Kaptiva Sports Academy', filePrefix: 'ksacademy', group: 'academy', flat: true,
    base: { brand: 'Kaptiva Sports Academy', principal: '#790B81', acento: '#AF6CB3', secundario: null, header: PIX + '6cc70ed029dd494b80735f821e8158a2.png', footer: PIX + '0e125d09d568466780e1bd113486df30.png', footerAlt: 'Kaptiva Sports Academy', fonts: ACADEMY_FONTS, contact: 'admissions@kaptivasports.com' },
    sections: [{ id: 'academy-short', section: 'SHORT SESSIONS' }, { id: 'academy-residential', section: 'RESIDENTIAL CAMPS' }] });
  // Grupos del hub (pantalla inicial y menú lateral). Solo cambia la organización, no el contenido de los emails.
  K.CLIENT.groups = [
    { id: 'stage', name: 'Kaptiva Global Stage' },
    { id: 'clubs', name: 'Clubs' },
    { id: 'academy', name: 'Kaptiva Sports Academy' }
  ];
  K.CLIENT.clubs.forEach(function (c) {
    c.group = c.group || 'clubs';
    c.sections.forEach(function (sec) {
      var t = { club: c.id, clubName: c.name, filePrefix: c.filePrefix, mediaBanner: null }, k;
      for (k in c.base) t[k] = c.base[k];
      for (k in sec) t[k] = sec[k];
      t.name = c.name + ' · ' + t.section; t.short = null;
      t.slug = t.section.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      K.CLIENT.tournaments.push(t);
    });
  });
  K.club = function (id) { return K.CLIENT.clubs.filter(function (c) { return c.id === id; })[0] || null; };

  // Campos dinámicos de Cvent permitidos (no se modifican nunca)
  K.CVENT_FIELDS = [
    '{[C-FIRST NAME]}', '{[C-FIRST NAME:TC]}', '{[E-MODIFY REG LINK]}', '{[C-CONFIRMATION NUM]}',
    '{[C-EMAIL]}', '{[E-CUSTOM:Event Phone Number]}', '{[P-FIRST NAME]}', '{[P-LAST NAME]}', '{[EMAIL OPT OUT]}'
  ];

  K.tournament = function (id) {
    return K.CLIENT.tournaments.filter(function (t) { return t.id === id; })[0] || K.CLIENT.tournaments[0];
  };
})(typeof window !== 'undefined' ? window : globalThis);

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
    name: 'KSA Global Stage',
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

  // Campos dinámicos de Cvent permitidos (no se modifican nunca)
  K.CVENT_FIELDS = [
    '{[C-FIRST NAME]}', '{[C-FIRST NAME:TC]}', '{[E-MODIFY REG LINK]}', '{[C-CONFIRMATION NUM]}',
    '{[C-EMAIL]}', '{[E-CUSTOM:Event Phone Number]}', '{[P-FIRST NAME]}', '{[P-LAST NAME]}', '{[EMAIL OPT OUT]}'
  ];

  K.tournament = function (id) {
    return K.CLIENT.tournaments.filter(function (t) { return t.id === id; })[0] || K.CLIENT.tournaments[0];
  };
})(typeof window !== 'undefined' ? window : globalThis);

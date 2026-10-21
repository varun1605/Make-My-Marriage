# Homepage assets

The homepage uses imagery selected from the user's Make My Marriage Platform
Stitch project (`16426202201826503075`). These are public marketing illustrations,
not private gallery uploads or customer photos.

- `images/palace-wedding.jpg`: the palace/couple image referenced by the Luxury
  Login design (`7936836ce22d4aa4bc3dcdd81d81c946`), reused in the homepage hero.
- `images/wedding-reception.jpg`: the reception illustration in screen
  `f98d8599ddd94b68b5738b2622eaee42`.

Images are stored locally; the application does not depend on temporary Stitch
download URLs or send a Stitch API key to the browser.

## Typography

The variable font files come from the official Google Fonts repository:

- [EB Garamond](https://github.com/google/fonts/tree/main/ofl/ebgaramond)
  (`EBGaramond[wght].ttf`), with `fonts/eb-garamond-OFL.txt`.
- [Manrope](https://github.com/google/fonts/tree/main/ofl/manrope)
  (`Manrope[wght].ttf`), with `fonts/manrope-OFL.txt`.

Both are distributed under the SIL Open Font License included alongside the
files. Fonts are served locally with `font-display: swap` and system fallbacks.

## Visual conventions

The reviewed homepage uses the design guide's warm ivory (`#F7F3ED`), wine
(`#5C2230`), champagne gold (`#C3A46D`), and sage (`#7D816D`). Gold used as small
text has a darker ink variant. Cards use 12–16px corners, buttons 8px, and the
hero has an architectural arch. Shared values live in `src/app/globals.css`.

Stitch supplies the visual reference. The frozen specifications control the
feature claims and examples: no budgeting, vendor payments, automated WhatsApp,
travel coordination, or RAW/video gallery uploads are advertised.

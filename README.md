# Daniil Uglovskiy — Portfolio

Source code for a bilingual personal portfolio focused on web systems
development and process automation.

## What is included

- Russian and English portfolio pages
- a detailed anonymized automation case study
- direct email and Telegram contacts
- privacy pages in both languages
- Open Graph social card
- responsive layout and reduced-motion support

## Local development

Requires Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

The local site is available at `http://localhost:3000`.

## Validation

```bash
npm run build
npm run lint
node --test tests/rendered-html.test.mjs
```

## License

No license is granted for reuse of the source code, visual identity, or
portfolio content unless explicitly agreed with the author.

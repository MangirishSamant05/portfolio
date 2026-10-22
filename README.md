# Mangirish Samant — Portfolio

Personal portfolio for data analyst, data engineer and data scientist roles. It's built with Next.js 16, TypeScript and Tailwind CSS v4, and exported as a static site.

---

## Quick start

You need **Node.js 20.9 or newer**.

```bash
npm install        # install dependencies
npm run dev        # http://localhost:3000, reloads as you edit
npm run build      # production build → static site in ./out
npm run start      # serve ./out locally to check the production build
npm run typecheck  # optional: TypeScript check without building
```

`npm run build` fails with a readable message if a project references a skill id that doesn't exist, or a stage points at a missing project. Fix the message it prints and run it again.

---

## Architecture and why

| Decision | Choice | Reason |
|---|---|---|
| Framework | Next.js App Router, `output: "export"` | Pre-rendered HTML for every page (good for SEO and speed), with no server to run or pay for. |
| Content | Typed TypeScript files in `src/content/` | Editing content never touches UI code. TypeScript catches typos at build time, and Git keeps the history. |
| Admin dashboard | Deliberately **not** built | A login-protected dashboard needs a database, authentication and a server, which means cost and attack surface. For one person updating a few times a month, editing a file and pushing is simpler and safer. |
| Styling | Tailwind v4 with CSS-variable design tokens | Both themes come from one token set (`src/app/globals.css`). |
| Charts and animation | Hand-written SVG and canvas, plus CSS | No chart or animation library, so the page loads fast. Everything respects `prefers-reduced-motion`. |
| Icons | A small inline icon set (`src/components/Icon.tsx`) | No icon dependency; brand marks included. |
| Contact form | Optional, using any JSON form endpoint | The form only appears when an endpoint is configured, so it never pretends to send. |
| GitHub | Optional client-side fetch of public repos | If GitHub is unavailable, the section falls back to a profile link. |

### Pages

- `/`: every section on one page, with smooth-scrolling navigation.
- `/projects/[slug]/`: one statically generated case study per published project.
- `/sitemap.xml` and `/robots.txt`, generated from the content.

### Home page sections

| Section | What it is |
|---|---|
| Hero | Availability pill, name and roles, an animated figure (raw data → cleaning → model → insight), and four headline numbers from the resume that count up and link to their evidence. |
| About | Paragraphs and quick facts from `profile.ts`. |
| How I work | The eight-stage workflow. Each stage opens the tools and projects where you did it. |
| Skills, with evidence | A skill × project matrix. A dot means the project used the skill; there are no self-rated percentages. |
| Projects | Filterable cards that link to the case studies. Includes your latest GitHub repos. |
| Results | Every metric on the site in one table, with what it was measured on. |
| Live demos | **SansadLens classifier**: type a parliamentary question and a compact copy of the model predicts the ministry, in the browser. **MandiPulse explorer**: 12 crops from the real AGMARKNET gold tables: price history with shock markers, seasonal index, state-vs-national gaps, findings computed live, a yearly table, and the Flajolet–Martin vs exact vs HyperLogLog chart. |
| Data pipeline | An architecture diagram using only tools from your resume. |
| Certifications and badges | A certificate gallery with full-size preview and verify links, plus badges grouped by topic. |
| Education and leadership | Timelines, plus a Recent learning panel. |
| Contact | Email with a copy button, profile links, and the optional form. |

### Quick navigation

Press **Ctrl+K** (⌘K on Mac) or the search icon in the header for a command palette: jump to any section or project, copy the email address, download the resume, open GitHub/LinkedIn or switch theme.

### Folder structure

```
public/
  resume/Mangirish-Samant-Resume.pdf   ← replace to update your resume
  credentials/                         ← certificate images and PDFs
  og.png                               ← image shown when the link is shared
src/
  app/
    layout.tsx          fonts, metadata, header and footer
    page.tsx            home page: assembles the sections
    projects/[slug]/    case-study page
    globals.css         design tokens (colours for both themes)
    sitemap.ts  robots.ts  icon.svg  not-found.tsx
  content/              ← EVERYTHING YOU EDIT LIVES HERE
    profile.ts          name, headline, about, links, resume path, site settings
    projects.ts         projects and case studies
    skills.ts           skills and skill areas
    journey.ts          "How I work" stages and the pipeline diagram
    credentials.ts      certificates and badges
    background.ts       education, experience/leadership, recent learning
    data/mandipulse.json  MandiPulse gold-table extract for the Live demos
scripts/
  export_mandipulse.py        regenerate data/mandipulse.json from MandiPulse/gold
  export_sansadlens_model.py  regenerate public/demo/sansadlens-model.json
  types/content.ts      the shape of every content file
  lib/                  content helpers, SansadLens browser classifier, utilities
  hooks/                reduced motion, in-view, active section
  components/           header, footer, icons, charts, shared UI
  sections/             one file per section
```

---

## Updating the portfolio

Edit the file, check it with `npm run dev`, then commit and push. The site redeploys on its own (see Deploying).

### Add a project

1. Open `src/content/projects.ts` and copy an existing project object.
2. Give it a unique `slug`. This becomes the URL, e.g. `/projects/my-new-project/`.
3. Fill in the fields:
   - `pipeline` lists only the stages the project actually covered.
   - `stack` uses skill ids from `skills.ts`.
   - Leave `results: []` if you don't have real numbers. Nothing is shown then.
4. Keep `status: "draft"` while you write it. Drafts show in `npm run dev` with a label and are left out of the production build. Change it to `"published"` when it's ready.

A **deep learning** project is set up as a draft at the bottom of the file, waiting for details. Small builds without a write-up go in `otherWork` at the end of the same file.

### Refresh the live demo data

Both demos read files produced from your own repositories, so they can be rebuilt any time:

```bash
pip install pandas pyarrow scikit-learn
python scripts/export_mandipulse.py ../MandiPulse/gold
python scripts/export_sansadlens_model.py ../SansadLens
```

The SansadLens script prints the compact model's held-out accuracy; the demo shows those numbers automatically.

### Add a certificate

1. Put the image in `public/credentials/`. A PNG, JPG or WebP about 1200px wide is plenty. Put the PDF next to it if you have one.
2. Add an entry to `certifications` in `src/content/credentials.ts`:

```ts
{
  id: "my-new-cert",
  title: "Certificate name",
  issuer: "Organisation",
  date: "2026-11-20",            // or "2026-11", or leave out
  credentialId: "ABC123",        // optional
  verifyUrl: "https://…",        // optional; shows a Verify button
  image: "/credentials/my-new-cert.webp",
  file: "/credentials/my-new-cert.pdf", // optional; shows Open PDF
  skills: ["Topic one", "Topic two"],
},
```

Certificates are sorted newest first automatically.

To turn a PDF into a preview image (needs poppler):

```bash
pdftoppm -r 110 -png -singlefile cert.pdf cert
```

### Add a badge

Add an entry to `badges` in `src/content/credentials.ts`:

- `verifyUrl`: the badge's URL on your public profile.
- `image`: right-click the badge image → **Copy image address**.
- `topic`: reuse "Generative AI & LLMs" or "Google Cloud infrastructure", or type a new topic to create a new group.

If a badge image ever fails to load, a neutral icon is shown in its place.

### Replace your resume

Overwrite `public/resume/Mangirish-Samant-Resume.pdf` and keep the same file name. To use a different name, change `resume.path` and `resume.fileName` in `profile.ts`.

### Update skills

Edit `src/content/skills.ts`. To show a skill as evidenced in the matrix, add its `id` to the `stack` of the projects that used it. A skill used by no project still appears under "Also in my toolkit".

### Update social links, email, About, availability or headline numbers

Everything is in `src/content/profile.ts`: `links`, `email`, `headline`, `availability` (the pill above your name; `""` hides it), `highlights` (the four numbers in the hero), `about` (one string per paragraph) and `facts`.

### Update education, experience or recent learning

Edit `src/content/background.ts`. When you get an internship, add it to `experience` with `kind: "internship"`.

### Turn on the contact form

1. Create a free form at formspree.io, or any service that accepts a JSON POST.
2. Set `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT` to its URL in your hosting dashboard (and in `.env.local` for local testing). See `.env.example`.
3. Redeploy. The form appears next to your email. Until the endpoint is set, the form isn't shown.

---

## Deploying (free)

**Recommended: GitHub → Vercel**

1. Push this folder to a new GitHub repository.
2. On vercel.com, choose **Add New → Project**, import the repository, and keep the defaults.
3. In **Settings → Environment Variables**, set `NEXT_PUBLIC_SITE_URL` to your live URL, e.g. `https://mangirish-samant.vercel.app` or your own domain.
4. Deploy. Every `git push` to `main` redeploys automatically.

Because the output is a plain static site in `out/`, it also works on Netlify, Cloudflare Pages or GitHub Pages with build command `npm run build` and publish directory `out`.

---

## Accessibility and performance

- Semantic landmarks and a skip link.
- Visible focus states and full keyboard support. The certificate dialog uses the native `<dialog>`.
- `aria-pressed` on filters, and live regions for changing results.
- The crop explorer has a yearly table view and legends on every multi-series chart, so no information is conveyed by colour alone.
- Chart colours are checked for colour-blind separation in both themes.
- Reduced motion stops the hero animation on its final frame and removes the pipeline packets.
- There is no chart or animation library. Images are lazy-loaded, and fonts are self-hosted by `next/font`.
- The theme follows the visitor's OS on first visit, then remembers their choice, with no flash of the wrong theme.

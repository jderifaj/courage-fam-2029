# courage-fam-2029

Family/player introduction site for the 2029 NC Courage Academy team, built with [Astro](https://astro.build) as a static site and deployed on Netlify.

## What this is

A homepage where each family on the team gets a profile card (photo, family name, player name, and a short write-up about the family — hobbies, pets, what the parents do), plus a section for the coach. The goal is for players, parents, and coaches to get to know one another off the field.

## Content structure

Family and coach content live as markdown files with frontmatter, so they're ready to be edited through a CMS (Decap CMS planned) once this repo is connected to Netlify:

- `src/content/families/*.md` — one file per family (frontmatter: `familyName`, `playerName`, `photo`; body: free-form "about us" markdown)
- `src/content/coach/*.md` — one file per coach

Add a new family by adding a new markdown file — the homepage picks it up automatically.

## Commands

| Command           | Action                                       |
| :----------------- | :-------------------------------------------- |
| `npm install`       | Install dependencies                          |
| `npm run dev`       | Start local dev server at `localhost:4321`    |
| `npm run build`     | Build the production site to `./dist/`        |
| `npm run preview`   | Preview the production build locally          |

## Deployment

Deployed as a static site on Netlify (see `netlify.toml`) — build command `npm run build`, publish directory `dist`.

# Equality News upkeep

Edit `content/stories.json` to add or update stories. Keep stable story IDs, fill in the summary and sections, and use related IDs that exist in the catalog. Every report must relate to Equality Studios / Equality News and clearly attribute community roleplay allegations.

Put supplied images in `public/assets`. The Equality logo lives at `public/assets/equality-logo.png`; it is a real deployed asset, independent of README image paths.

Committing changes to `main` automatically builds, checks, and publishes the site with `.github/workflows/pages.yml`. A failed build or check prevents deployment. The workflow can also be run manually from Actions.

To check a change locally with Node.js 24:

```sh
npm run build
npm test
```

The generated `dist` folder is the entire public website. Hosting uses GitHub Pages with GitHub Actions as the publishing source and HTTPS enabled. No external credentials or paid services are required by the site.

Search includes the complete article text. The Popular section begins with desk picks, then uses reading activity saved on that visitor's device. It is not a site-wide audience chart. There is no automatic news gathering; new reports require an editorial update to the catalog.

The older ZIP is preserved as an archive and is not part of the deployed website.

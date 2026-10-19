# Deployment and updates

The complete application builds as a static Vite site. Source repository: `https://github.com/chaifish-teacher/religion`, branch `main`. GitHub source publication is authorized by the user; Vercel website deployment has not been performed, and no public website URL is verified. No Vercel CLI, deployment binding or project configuration was available in this session.

## Publish the website after deployment target/authorization is confirmed

1. Run `npm ci`, `npm test`, `npm run test:e2e`, and `npm run build`.
2. Review source and content changes. The original PPTX and textbook photographs must remain outside the project; no secrets are required by the site.
3. Commit reviewed updates and push to `main` in the authorized GitHub repository.
4. In Vercel, import that repository. Select Vite, build command `npm run build`, output directory `dist`. No application environment variables are needed.
5. Deploy, then check the public site, all six learning modules, audio fallback, a full game/recovery/Boss retry, and desktop/mobile behavior.

For updates, edit source content in `src/data`, rerun validation/tests/build, review and push the change. A connected Vercel project can rebuild automatically. See `README.md` for the exact data files and question schema.

## Local production verification

```sh
npm run build
npm run preview -- --port 4173
# In a separate shell, test the production build rather than the dev server:
MAZU_TEST_BASE_URL=http://127.0.0.1:4173 npm run test:e2e
```

Cloud environment configuration and website deployment are separate. Saved install/start instructions are a draft for the environment; reviewing, saving and publishing that environment does not publish the website to Vercel.

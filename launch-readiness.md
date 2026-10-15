# Launch readiness

## Goal
Make the frontend and backend start reliably together, with the dashboard able to load its API data.

## Tasks
- [x] Inspect startup scripts, dependencies, and source imports → Verify: identify reproducible launch failures.
- [x] Build the frontend and start the backend → Verify: compilation and API health checks succeed.
- [x] Fix each confirmed source or startup-script defect → Verify: rerun the affected build or server.
- [x] Validate the combined local launch path → Verify: frontend returns 200 and backend endpoints return JSON.

## Done When
- [x] `npm run dev` starts both services without manual setup.
- [x] The frontend build and core API endpoints succeed.

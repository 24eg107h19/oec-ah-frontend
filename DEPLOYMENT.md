# Deploy the e-commerce app

The project is in two GitHub repositories:

- Frontend: `24eg107h19/oec-ah-frontend` (this repository)
- Backend: `24eg107h19/E-commerce-backend`

The frontend is React with Vite. The backend is Spring Boot 3.4.3 and Java 21.
The default local database is in-memory H2. The backend also has a MySQL
profile. For Render, use a persistent Render PostgreSQL database; production
configuration requires database settings and does not silently fall back to
in-memory H2.

## 1. Deploy the backend on Render

1. Create a PostgreSQL database in Render. Keep it in the same region as the
   web service and copy its **internal hostname**, database name, username, and
   password from the Render dashboard.
2. Create a **Web Service** connected to `24eg107h19/E-commerce-backend`.
3. Set the service root directory to `.` and environment to **Docker**. The
   root Dockerfile uses Java 21, packages the application, and starts the JAR.
   Leave Render's Docker build and start command overrides blank.
4. Add these environment variables to the Render service:

   | Key | Value |
   | --- | --- |
   | `SPRING_PROFILES_ACTIVE` | `prod` |
   | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://<internal-hostname>:5432/<database-name>` |
   | `SPRING_DATASOURCE_USERNAME` | Render PostgreSQL username |
   | `SPRING_DATASOURCE_PASSWORD` | Render PostgreSQL password |
   | `SPRING_JPA_DDL_AUTO` | `update` |
   | `APP_CORS_ALLOWED_ORIGINS` | `http://localhost:5173` initially; replace with the Vercel site's exact `https://...` origin after deploying the frontend |
   | `ADMIN_EMAIL` | The email address for the private administrator account |
   | `ADMIN_PASSWORD` | A unique, strong password stored only in Render's environment settings |
   | `JWT_SECRET` | Generate a base64-encoded 32-byte random key (for example, with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`); store it only in Render |

   Render supplies `PORT` to the service. Do not hard-code it in the dashboard.
   The application reads it automatically.
5. Deploy and wait for Render to report the service as **Live**. Copy the
   service's public HTTPS URL, such as `https://<service-name>.onrender.com`.

The app creates its tables and initial sample products when the database is
empty. `ADMIN_EMAIL` and `ADMIN_PASSWORD` provision the admin account at startup;
keep these values set in Render so the account stays available after restarts.
Keep `JWT_SECRET` unchanged so previously issued tokens remain valid until they
expire. New public registrations are regular customer accounts only.

The API uses short-lived JWT bearer tokens. Customers can access only their own
carts and orders; product changes, order status changes, and the all-orders
endpoint require the admin role. Public product browsing remains available.

## 2. Deploy the frontend on Vercel

1. Import `24eg107h19/oec-ah-frontend` into Vercel.
2. Set the root directory to `.`. Choose the **Vite** framework preset.
3. Use build command `npm run build` and output directory `dist`.
4. Add this Vercel environment variable for **Production**:

   | Key | Value |
   | --- | --- |
   | `VITE_API_BASE_URL` | `https://<service-name>.onrender.com/api` |

   Replace the example host with the HTTPS URL copied from Render. This value
   is public frontend configuration, not a secret. Do not put database
   passwords or administrator credentials in Vercel.
5. Deploy and copy the Vercel site's exact HTTPS origin, without a path or
   trailing slash (for example, `https://<project>.vercel.app`).
6. In Render, change `APP_CORS_ALLOWED_ORIGINS` to that exact Vercel origin.
   Add more comma-separated exact origins only if you have additional trusted
   domains. Save and let Render redeploy.

The Vercel rewrite configuration supports direct navigation to React Router
pages. `.env.example` is for local development; Vercel's dashboard environment
variable is used for production, so a committed `.env.production` is not
needed.

## 3. Verify after deployment

1. Open `https://<service-name>.onrender.com/api/products`; expect a JSON list.
2. Open the Vercel site, browse products, and open a product detail page.
3. Register a customer account and sign in.
4. Add a product to the cart and place a test order; check the user's Orders
   page.
5. Verify the configured admin can update a product and view all orders. Verify
   a customer cannot access another user's cart/orders or admin APIs.
6. Check the Render logs and browser developer console for database, CORS,
   authorization, or network errors.

Do not treat the deployment as verified until these live checks succeed. Render
and Vercel URLs and dashboard environment values are specific to the accounts
and services created during deployment.

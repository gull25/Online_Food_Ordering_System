# Foodora — Online Food Ordering System

A MERN food-delivery platform with four participants: customers, restaurant owners,
couriers, and the platform itself. Live order tracking runs over Socket.IO; card
payments go through Stripe Connect so funds split between the restaurant and the
platform.

```
client/   React 19 + Vite 8 + Tailwind v4 + Redux Toolkit
server/   Express 5 + Mongoose 9 + Socket.IO + Zod
docker/   MongoDB 8 for local development
```

## Running it

```bash
# 1. Database (or point MONGO_URI at an existing instance)
npm run db:up

# 2. Configure the API. The server refuses to start without a valid config.
cp server/.env.example server/.env
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"   # → JWT_SECRET

# 3. Install and run both halves
npm install && npm install --prefix server && npm install --prefix client
npm run dev            # API on :5000, client on :5173
```

`npm run seed --prefix server` loads demo restaurants, menus and accounts.

## Configuration

`server/src/config/env.js` validates the environment at boot and exits with a
readable report if anything is missing or malformed. There are no fallback
secrets: a missing `JWT_SECRET` stops the process rather than silently signing
tokens with a default.

| Variable | Required | Effect when unset |
| --- | --- | --- |
| `MONGO_URI` | yes | Will not start |
| `JWT_SECRET` | yes (≥32 chars) | Will not start |
| `CLIENT_URL` | no | Defaults to `http://localhost:5173`; drives the CORS allowlist |
| `TRUST_PROXY` | no | Set `true` only behind a real reverse proxy — otherwise clients can spoof their IP past the rate limiter |
| `CLOUDINARY_*` | no | Uploads store a placeholder reference |
| `STRIPE_SECRET_KEY` | no | Card routes answer 503; other routes unaffected |
| `STRIPE_WEBHOOK_SECRET` | with Stripe | Webhook rejects everything (it cannot verify the signature) |
| `EASYPAISA_HASH_KEY`, `JAZZCASH_INTEGRITY_SALT` | with wallets | Those callbacks reject every request |
| `SMTP_*` | no | Mail is logged instead of sent |

The wallet and webhook behaviour is deliberate. Those endpoints are
unauthenticated by nature — the gateway calls them, not the user — so the shared
secret is the only thing distinguishing the gateway from anyone else who knows
the URL. Without it there is no safe way to honour the request.

## Architecture

**Server** — `routes → middleware → controller → service → repository → model`.

- **Routes** wire up auth, role checks, rate limits and validation. They are the
  only place those concerns are declared.
- **Validation** (`src/validations/*`) runs before every controller and *replaces*
  `req.body`/`req.query`/`req.params` with the parsed result. Zod strips unknown
  keys, so a controller can only see fields its schema declares — this is what
  keeps client-supplied `role`, `isFeatured`, `totalAmount` and `status` out of
  the database.
- **Services** own business rules and ownership checks. Role membership alone is
  never authorisation: a restaurant owner may only touch *their* orders, a
  courier only *their* delivery.
- **Repositories** own queries. Every list is paginated and every query projects
  explicit fields.
- **Pricing** lives in `src/utils/pricing.js` and is mirrored, constant for
  constant, by `client/src/helper/pricing.js`, so the total quoted at checkout is
  the total charged. The server never trusts a price from the client; it re-derives
  every one from the database.

**Realtime** — the Socket.IO handshake is authenticated with the same JWT as the
REST API. Identity comes from the token, and joining an order room is authorised
against that order, so a client cannot subscribe to a stranger's delivery or
report a courier's position on their behalf.

## Tests

```bash
npm test --prefix server        # both suites
npm run test:schemas --prefix server   # payload shapes → validation schemas
npm run test:http --prefix server      # in-process HTTP: headers, CORS, auth, limits
```

Neither suite needs a database — they cover the layers that run before one is
touched. `test:http` includes regression checks for the specific vulnerabilities
this codebase had: a token forged with the old hardcoded secret, a `role: admin`
registration, an unsigned wallet callback confirming an order as paid, and a
regex payload used as a promo code.

## Conventions

- Money is rounded to whole cents at every boundary, never accumulated as raw
  floats and rounded once at the end.
- Access-control failures on a resource the caller cannot see answer **404**, not
  403 — a 403 confirms the id is real, which is exactly what an enumeration
  attack is looking for.
- Errors return one JSON shape (`{ success, message, errors? }`). Internal
  faults are logged in full and reported generically; stack traces are only
  included outside production.
- Client state: Redux for cross-screen data (auth, cart, orders), local state for
  everything else. The cart is the only persisted slice.

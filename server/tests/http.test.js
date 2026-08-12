/* In-process smoke test: routing, middleware order, validation, auth, headers. */
process.env.NODE_ENV = "development";

const http = require("http");
const path = require("path");

const SERVER = path.resolve(__dirname, "..");
const app = require(path.join(SERVER, "src/app.js"));

const server = http.createServer(app);

const request = (method, url, { body, headers = {}, origin } = {}) =>
    new Promise((resolve, reject) => {
        const payload = body === undefined ? null : JSON.stringify(body);
        const req = http.request(
            {
                host: "127.0.0.1",
                port: server.address().port,
                method,
                path: url,
                /*
                 * No connection pooling. Rejecting an oversized body with 413
                 * leaves that socket unusable, and a pooled agent would hand the
                 * same socket to the next request, which then stalls forever.
                 */
                agent: false,
                headers: {
                    connection: "close",
                    ...(payload ? { "content-type": "application/json", "content-length": Buffer.byteLength(payload) } : {}),
                    ...(origin ? { origin } : {}),
                    ...headers,
                },
            },
            (res) => {
                let data = "";
                res.on("data", (chunk) => (data += chunk));
                res.on("end", () => {
                    let json;
                    try { json = JSON.parse(data); } catch { json = data; }
                    resolve({ status: res.statusCode, headers: res.headers, body: json });
                });
            },
        );
        req.on("error", reject);
        if (payload) req.write(payload);
        req.end();
    });

const raw = (method, url, payload) =>
    new Promise((resolve, reject) => {
        const req = http.request(
            {
                host: "127.0.0.1",
                port: server.address().port,
                method,
                path: url,
                agent: false,
                headers: {
                    connection: "close",
                    "content-type": "application/json",
                    "content-length": Buffer.byteLength(payload),
                },
            },
            (res) => {
                let data = "";
                res.on("data", (chunk) => (data += chunk));
                res.on("end", () => {
                    let json;
                    try { json = JSON.parse(data); } catch { json = data; }
                    resolve({ status: res.statusCode, headers: res.headers, body: json });
                });
            },
        );
        req.on("error", reject);
        req.end(payload);
    });

let passed = 0;
let failed = 0;

const check = (name, condition, detail) => {
    if (condition) {
        passed += 1;
        console.log(`  PASS  ${name}`);
    } else {
        failed += 1;
        console.log(`  FAIL  ${name}${detail ? ` — ${JSON.stringify(detail)}` : ""}`);
    }
};

const run = async () => {
    console.log("\n── Security headers & 404 shape ──");
    const notFound = await request("GET", "/api/definitely-not-a-route");
    check("unknown route → 404 JSON", notFound.status === 404 && notFound.body?.success === false, notFound.body);
    check("x-powered-by removed", !notFound.headers["x-powered-by"]);
    check("helmet nosniff present", notFound.headers["x-content-type-options"] === "nosniff");
    check("helmet frameguard present", Boolean(notFound.headers["x-frame-options"] || notFound.headers["content-security-policy"]));
    check("referrer-policy set", notFound.headers["referrer-policy"] === "no-referrer");

    console.log("\n── CORS allowlist ──");
    const evil = await request("GET", "/api/restaurants", { origin: "https://evil.example" });
    check("disallowed origin rejected (403)", evil.status === 403, { status: evil.status });
    const good = await request("GET", "/api/health", { origin: "http://localhost:5173" });
    check("allowed origin reflected", good.headers["access-control-allow-origin"] === "http://localhost:5173");

    console.log("\n── Health ──");
    const health = await request("GET", "/api/health");
    check("health reports real db state (503 while disconnected)", health.status === 503 && health.body.db === "disconnected", health.body);

    console.log("\n── Auth: no token ──");
    const noToken = await request("GET", "/api/orders/my-orders");
    check("protected route without token → 401", noToken.status === 401, noToken.body);

    console.log("\n── Auth: bad token ──");
    const badToken = await request("GET", "/api/orders/my-orders", { headers: { authorization: "Bearer not.a.jwt" } });
    check("malformed token → 401 with jwt message", badToken.status === 401 && /token/i.test(badToken.body.message), badToken.body);

    console.log("\n── Auth: forged token under the old hardcoded secret ──");
    const jwt = require("jsonwebtoken");
    const forged = jwt.sign({ id: "507f1f77bcf86cd799439011" }, "secretkey123", { expiresIn: "7d" });
    const forgedRes = await request("GET", "/api/orders/my-orders", { headers: { authorization: `Bearer ${forged}` } });
    check("token signed with 'secretkey123' rejected", forgedRes.status === 401, forgedRes.body);

    console.log("\n── Validation: registration ──");
    const weak = await request("POST", "/api/auth/register", {
        body: { name: "A", email: "not-an-email", password: "123" },
    });
    check("invalid registration → 400", weak.status === 400, { status: weak.status });
    check("400 carries field-level errors", Array.isArray(weak.body.errors) && weak.body.errors.length > 0, weak.body);

    console.log("\n── Validation: privilege escalation attempt ──");
    const escalate = await request("POST", "/api/auth/register", {
        body: { name: "Mallory", email: "m@example.com", password: "Password123", role: "admin" },
    });
    check(
        "role:'admin' rejected by enum (not silently accepted)",
        escalate.status === 400 && JSON.stringify(escalate.body).includes("role"),
        escalate.body,
    );

    console.log("\n── Validation: object-id params ──");
    const badId = await request("GET", "/api/restaurants/;drop-everything", { headers: {} });
    check("non-ObjectId path param → 400", badId.status === 400, { status: badId.status, body: badId.body });

    console.log("\n── Validation: NoSQL operator injection ──");
    // Express 5's `simple` query parser cannot build nested objects, so bracket
    // syntax stays a literal key and is stripped as unknown. A JSON body can
    // carry any shape, which is where the objectId guard earns its keep.
    const injection = await request("POST", "/api/reviews", {
        headers: { authorization: "Bearer x.y.z" },
        body: { orderId: { $ne: null }, rating: 5 },
    });
    check("operator object in a JSON body never reaches the query builder", [400, 401].includes(injection.status), injection.body);

    console.log("\n── Validation: regex payload in promo code ──");
    const redos = await request("GET", "/api/public/offers/validate/" + encodeURIComponent(".*"));
    check("regex wildcard promo code rejected → 400", redos.status === 400, redos.body);

    console.log("\n── Validation: query pagination coercion + ceiling ──");
    const hugeLimit = await request("GET", "/api/restaurants?limit=100000");
    check("limit above ceiling → 400", hugeLimit.status === 400, { status: hugeLimit.status });

    console.log("\n── Payments: unsigned wallet callback ──");
    const easypaisa = await request("POST", "/api/payments/easypaisa/callback", {
        body: { orderId: "507f1f77bcf86cd799439011", transactionId: "TX1", status: "SUCCESS" },
    });
    check(
        "unauthenticated 'SUCCESS' callback no longer confirms an order",
        easypaisa.status === 503 || easypaisa.status === 401,
        { status: easypaisa.status, body: easypaisa.body },
    );

    const jazzcash = await request("POST", "/api/payments/jazzcash/callback", {
        body: { orderId: "507f1f77bcf86cd799439011", pp_TxnRefNo: "TX1", pp_ResponseCode: "000" },
    });
    check(
        "unauthenticated JazzCash callback rejected",
        jazzcash.status === 503 || jazzcash.status === 401,
        { status: jazzcash.status },
    );

    console.log("\n── Payments: unsigned Stripe webhook ──");
    const webhook = await request("POST", "/api/payments/webhook", { body: { type: "payment_intent.succeeded" } });
    check("webhook without signature rejected", webhook.status === 400 || webhook.status === 503, { status: webhook.status });

    console.log("\n── Malformed JSON ──");
    // Sends real bytes. Declaring a content-length and then sending nothing makes
    // the server wait for a body that never arrives, which hangs the suite rather
    // than testing anything.
    const malformed = await raw("POST", "/api/auth/login", "{not json");
    check(
        "malformed JSON → 400 JSON (not an HTML 500)",
        malformed.status === 400 && malformed.body?.success === false,
        malformed.body,
    );

    // Last: rejecting an oversized body mid-upload leaves that socket being torn
    // down, which is a poor state to start the next request from.
    console.log("\n── Body size limit ──");
    const big = await request("POST", "/api/auth/login", { body: { email: "a@b.co", password: "x".repeat(2 * 1024 * 1024) } });
    check("2MB body → 413", big.status === 413, { status: big.status });

    console.log(`\n${passed} passed, ${failed} failed\n`);
    server.close();
    process.exit(failed === 0 ? 0 : 1);
};

server.listen(0, "127.0.0.1", () => {
    run().catch((error) => {
        console.error(error);
        server.close();
        process.exit(1);
    });
});

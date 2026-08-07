/*
 * Runs once, the first time the mongo container starts with an empty data volume.
 * Creates a least-privilege application user scoped to the app database, so the
 * API never has to connect with the root account.
 */
const dbName = process.env.MONGO_INITDB_DATABASE || "foodora";
const user = process.env.MONGO_APP_USER;
const pwd = process.env.MONGO_APP_PASSWORD;

if (!user || !pwd) {
    print("MONGO_APP_USER / MONGO_APP_PASSWORD not set - skipping app user creation");
} else {
    const appDb = db.getSiblingDB(dbName);

    appDb.createUser({
        user,
        pwd,
        roles: [{ role: "readWrite", db: dbName }],
    });

    print(`Created application user "${user}" with readWrite on "${dbName}"`);
}

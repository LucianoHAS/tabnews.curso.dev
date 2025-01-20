import { createRouter } from "next-connect";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";
import { InternalServerError, MethodNotAllowedError } from "infra/errors";

const router = createRouter();
router.get(getHandler);
router.post(postHandler);

export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler
});

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(err, request, response) {
  const publicErrorObject = new InternalServerError({
    cause: err
  });

  console.log("\nErro dentro do catch do next-connect");
  console.error(publicErrorObject);
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

async function getHandler(request, response) {
  const pendingMigrations = await runMigrations();
  return response.status(200).json(pendingMigrations);
}

async function postHandler(request, response) {
  const pendingMigrations = await runMigrations(false);

  if (pendingMigrations.length > 0) {
    return response.status(201).json(pendingMigrations);
  }

  return response.status(200).json(pendingMigrations);
}

async function runMigrations(dryRun = true) {
  const dbClient = await database.getNewClient();
  const migrations = await migrationRunner({
    databaseUrl: dbClient,
    dryRun: dryRun,
    dir: resolve("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations"
  });
  await dbClient.end();
  return migrations;
}

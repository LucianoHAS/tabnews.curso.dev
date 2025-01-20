import database from "infra/database.js";
import { InternalServerError } from "infra/errors";

async function status(request, response) {
  try {
    const updatedAt = new Date().toISOString();

    const databaseVersionResult = await database.query("show server_version;");
    const databaseVersionValue = databaseVersionResult.rows[0].server_version;

    const databaseMaxConnectionsResult = await database.query(
      "show max_connections;"
    );
    const databaseMaxConnectionsValue = parseInt(
      databaseMaxConnectionsResult.rows[0].max_connections
    );

    const databaseName = process.env.POSTGRES_DB;
    const databaseOpenedConnectionsResult = await database.query({
      text: "select count(*)::int from pg_stat_activity where datname = $1;",
      values: [databaseName]
    });

    const databaseOpenedConnectionsValue =
      databaseOpenedConnectionsResult.rows[0].count;

    response.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          version: databaseVersionValue,
          max_connections: databaseMaxConnectionsValue,
          opened_connections: databaseOpenedConnectionsValue
        }
      }
    });
  } catch (err) {
    const publicErrorObject = new InternalServerError({
      cause: err
    });

    console.log("\n Erro dentro do catch do controller");
    console.error(publicErrorObject);

    response.status(500).json(publicErrorObject);
  }
}

export default status;

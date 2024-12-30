import database from "infra/database.js";

async function status(request, response) {
  const result = await database.query("select 1 + 1 sum;");
  console.log(result.rows);
  response.status(200).json({ mesage: "São acima da média" });
}

export default status;

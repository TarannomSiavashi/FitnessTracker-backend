const express = require("express");
const postgres = require("postgres");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173/",
    methods: ["Get", "POST"],
  })
);
// const allowedOrigins = ['http://localhost:5173'];
// app.use(cors({
//   origin: allowedOrigins
// }));

// app.use(function (_, res, next) {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//     res.setHeader('Access-Control-Allow-Credentials', true);
//     next();
// });
const port = 3000;

// app.js
// const postgres = require('postgres');
// require('dotenv').config();

// let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;
PGHOST = "ep-restless-salad-a5j0d4v3.us-east-2.aws.neon.tech";
PGDATABASE = "neondb";
PGUSER = "siavashi.tarannom";
PGPASSWORD = "vMhb7yRKlgO0";
ENDPOINT_ID = "ep-restless-salad-a5j0d4v3";

const sql = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: "require",
  connection: {
    options: `project=${ENDPOINT_ID}`,
  },
});

async function getPgVersion() {
  const result = await sql`select version()`;
  console.log(result);
}

getPgVersion();

app.get("/records", async (request, response) => {
  try {
    result = await sql`select * from records`;
    response.send(result);
  } catch (error) {
    console.error("Error deleting task:", error);
    response.status(500).send("Internal Server Error");
  }
});

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  try {
    console.log(username);
    console.log(password);

    const foundUser =
      await sql`select * from user_info where name = ${username} and password = ${password}`;
    if (foundUser && foundUser.length > 0) {
      response.send(foundUser);
      console.log("found");
    }
  } catch (error) {
    response.send(error);
    console.log("not found");
  }
});

app.put("/edit/:id", async (request, response) => {
  try {
    const userId = +request.params.id;
    const user = request.body
    const existingUser = await sql`SELECT * FROM user_info WHERE id = ${userId}`;
    if (existingUser.length === 0) {
        response.status(404).send('User not found');
        return;
    }

    const updateResult = await sql`
        UPDATE user_info
        SET  name = ${user.name}
            weight = ${user.weight}
            height = ${user.height}
            birthdate = ${user.birthdate}
        WHERE id = ${userId}
    `;
  } catch (error) {
    console.error('Error updating User:', error);
    response.status(500).send('Internal Server Error');
  }
});

app.listen(port, () =>
  console.log(`My app listening at http://localhost:${port}`)
);

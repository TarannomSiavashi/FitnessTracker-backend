const express = require("express");
const postgres = require("postgres");
const cors = require("cors");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT"],
  })
);

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
// PGHOST = "ep-restless-salad-a5j0d4v3.us-east-2.aws.neon.tech";
// PGDATABASE = "neondb";
// PGUSER = "siavashi.tarannom";
// PGPASSWORD = "vMhb7yRKlgO0";
// ENDPOINT_ID = "ep-restless-salad-a5j0d4v3";

// const sql = postgres({
//   host: PGHOST,
//   database: PGDATABASE,
//   username: PGUSER,
//   password: PGPASSWORD,
//   port: 5432,
//   ssl: "require",
//   connection: {
//     options: `project=${ENDPOINT_ID}`,
//   },
// });

// app.js
// const postgres = require('postgres');
// require('dotenv').config();

// let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;

PGHOST = "ep-shiny-snow-a5owxvou.us-east-2.aws.neon.tech";
PGDATABASE = "FitnessTracker";
PGUSER = "tarannomsiavashy";
PGPASSWORD = "jTf7ROv9rgZx";
ENDPOINT_ID = "ep-shiny-snow-a5owxvou";

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

async function getPgVersion() {
  const result = await sql`select version()`;
  console.log(result);
}

getPgVersion();

// GET Requests:

app.get("/user/:id", async (request, response) => {
  try {
    const id = +request.params.id;
    const user =
      await sql`select id,name,weight,height,birthdate from userinfo where id = ${id}`;
    console.log(user);
    response.send(user);
  } catch (error) {
    console.error("Error finding user:", error);
    response.status(500).send("Internal Server Error");
  }
});

app.get("/pr/:id", async (request, response) => {
  try {
    const id = +request.params.id;
    const result = await sql`
    SELECT *
    FROM personal_records
    where userid = ${id};
  `;
    response.send(result);
  } catch (error) {
    console.error("Error finding personal records:", error);
    response.status(500).send("Internal Server Error");
  }
});

app.get("/record/:id/:prid", async (request, response) => {
  try {
    const id = +request.params.id;
    const prId = +request.params.prid;
    const result = await sql`
    SELECT record.*, personal_records.*
    FROM record
    INNER JOIN personal_records ON record.prid = personal_records.prid
    where record.prid = ${prId} and personal_records.userid = ${id}
    ORDER BY record.prdate DESC
    LIMIT 1;
  `;
    response.send(result);
  } catch (error) {
    console.error("Error finding personal records:", error);
    response.status(500).send("Internal Server Error");
  }
});

app.get("/records/:id/:prid", async (request, response) => {
  try {
    const id = +request.params.id;
    const prId = +request.params.prid;
    const result = await sql`
    SELECT record.*, personal_records.*
    FROM record
    INNER JOIN personal_records ON record.prid = personal_records.prid
    where record.prid = ${prId} and personal_records.userid = ${id}
    ORDER BY TO_DATE(record.prdate, 'YYYY-MM-DD') DESC;
  `;
    response.send(result);
  } catch (error) {
    console.error("Error finding personal records:", error);
    response.status(500).send("Internal Server Error");
  }
});

app.get("/dailys/:id", async (request, response) => {
  try {
    const id = +request.params.id;
    const result = await sql`
    SELECT *
    FROM daily_goal
    where userid = ${id};
  `;
    response.send(result);
  } catch (error) {
    console.error("Error finding dayily goal:", error);
    response.status(500).send("Internal Server Error");
  }
});

app.get("/monthlys/:id", async (request, response) => {
  try {
    const id = +request.params.id;
    const result = await sql`
    SELECT *
    FROM monthly_goal
    where userid = ${id};
  `;
    response.send(result);
  } catch (error) {
    console.error("Error finding monthly goal:", error);
    response.status(500).send("Internal Server Error");
  }
});

app.get("/monthday/:id/:monthid", async (request, response) => {
  try {
    const id = +request.params.id;
    const monthId = +request.params.monthid;

    const result = await sql`
    SELECT *
    FROM monthly_goal AS mg
    JOIN monthly_daily AS dm ON mg.monthid = dm.monthlyid
    JOIN daily_goal AS dg ON dm.dailyid = dg.dayid
    WHERE mg.userid = ${id} AND mg.monthid = ${monthId};
  `;
    response.send(result);
  } catch (error) {
    console.error("Error finding monthly and daily goal:", error);
    response.status(500).send("Internal Server Error");
  }
});

// POST Requests:

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  try {
    console.log(username);
    console.log(password);

    const foundUser =
      await sql`select id from userinfo where name = ${username} and password = ${password}`;

    if (foundUser && foundUser.length > 0) {
      // response.status(200).json(foundUser);
      response.send(foundUser);
      console.log(foundUser);
      console.log("User found");
    } else {
      response.status(401).json({ error: "Invalid username or password" });
      console.log("User not found");
    }
  } catch (error) {
    console.error("Error during login:", error);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/newRecord", async (request, response) => {
  const { prid, prdate, metric, note } = request.body;
  try {
    const insertResult = await sql`
        INSERT INTO record (prid, prdate, metric, note)
        VALUES (${prid}, ${prdate}, ${metric}, ${note})
        RETURNING *
    `;
    response.status(201).json(insertResult[0]);
  } catch (error) {
    console.error("Error creating record:", error);
    response.status(500).send("Internal Server Error");
  }
});

app.post("/newCategory", async (request, response) => {
  const { userid, title, unit } = request.body;
  try {
    const insertResult = await sql`
        INSERT INTO personal_records (userid, title, unit)
        VALUES (${userid}, ${title}, ${unit})
        RETURNING *
    `;
    response.status(201).json(insertResult[0]);
  } catch (error) {
    console.error("Error creating Category:", error);
    response.status(500).send("Internal Server Error");
  }
});

app.post("/newDaily", async (request, response) => {
  const { dayid, title, desc, metric, alarm, userid, status } = request.body;
  try {
    const insertResult = await sql`
        INSERT INTO daily_goal (dayid, title, description, metric, alarmtime, userid, status)
        VALUES (${dayid}, ${title}, ${desc}, ${metric}, ${alarm}, ${userid}, ${status})
        RETURNING *
    `;
    response.status(201).json(insertResult[0]);
  } catch (error) {
    console.error("Error creating daily goal:", error);
    response.status(500).send("Internal Server Error");
  }
});

app.post("/newMonthly", async (request, response) => {
  const { monthid, title, desc, start, end, userid } = request.body;
  const status = false;
  try {
    const insertResult = await sql`
        INSERT INTO monthly_goal (monthid, title, description, startdate, deadline, userid, status)
        VALUES (${monthid}, ${title}, ${desc}, ${start}, ${end}, ${userid}, ${status})
        RETURNING *
    `;
    response.status(201).json(insertResult[0]);
  } catch (error) {
    console.error("Error creating monthly goal:", error);
    response.status(500).send("Internal Server Error");
  }
});

app.post("/dayMonth", async (request, response) => {
  const { monthid, dayid} = request.body;
  try {
    const insertResult = await sql`
        INSERT INTO monthly_daily (monthlyid, dailyid)
        VALUES (${monthid}, ${dayid})
        RETURNING *
    `;
    response.status(201).json(insertResult[0]);
  } catch (error) {
    console.error("Error creating monthly_daily goal:", error);
    response.status(500).send("Internal Server Error");
  }
});

// PUT Requests:

app.put("/edit/:id", async (request, response) => {
  try {
    const userId = +request.params.id;
    const user = request.body;
    const existingUser = await sql`SELECT * FROM userinfo WHERE id = ${userId}`;
    if (existingUser.length === 0) {
      response.status(404).send("User not found");
      return;
    }
    const updateResult = await sql`
        UPDATE userinfo
        SET  name = ${user.name},
            weight = ${user.weight},
            height = ${user.height},
            birthdate = ${user.birthdate}
        WHERE id = ${userId}
    `;
    response.send("Successful update");
  } catch (error) {
    console.error("Error updating User:", error);
    response.status(500).send("Internal Server Error");
  }
});

app.put('/daily/:id/:dayid', async (request, response) => {
  try {
      const userid = +request.params.id;
      const dayid = +request.params.dayid;
      const status = +request.body.status; 
      
      if (isNaN(status)) {
          response.status(400).send('Invalid status value');
          return;
      }
      
      const existingGoal = await sql`SELECT * FROM daily_goal WHERE userid = ${userid} and dayid = ${dayid}`;
      if (existingGoal.length === 0) {
          response.status(404).send('Daily goal not found');
          return;
      }

      const updateResult = await sql`
          UPDATE daily_goal
          SET  status = ${status}
          WHERE userid = ${userid} and dayid = ${dayid}
      `;
      response.send(updateResult);
  } catch (error) {
      console.error('Error updating daily goal:', error);
      response.status(500).send('Internal Server Error');
  }
});

app.put('/monthly/done/:id/:monthid', async (request, response) => {
  try {
      const userid = +request.params.id;
      const monthid = +request.params.monthid;

      const existingGoal = await sql`SELECT * FROM monthly_goal WHERE userid = ${userid} and monthid = ${monthid}`;
      if (existingGoal.length === 0) {
          response.status(404).send('Monthly goal not found');
          return;
      }

      const updateResult = await sql`
          UPDATE monthly_goal
          SET  status = ${true}
          WHERE userid = ${userid} and monthid = ${monthid}
      `;
      response.send(updateResult);
  } catch (error) {
      console.error('Error updating monthly goal:', error);
      response.status(500).send('Internal Server Error');
  }
});

app.listen(port, () =>
  console.log(`My app listening at http://localhost:${port}`)
);

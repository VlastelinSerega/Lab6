const { Pool } = require("pg");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
const pool = new Pool({
  user: "gyebwbggzumbve",
  host: "ec2-79-125-26-232.eu-west-1.compute.amazonaws.com",
  database: "dec6hq09g7pqja",
  password: "600d9691eead71a898333abcfdf63774c1b95189d47dd4ce5a7d8428fbd50d2c",
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
    ca: fs.readFileSync("rds-ca-2019-eu-west-1.pem").toString()
  }
});

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

app.use(bodyParser.json({ type: "application/json" }));
app.listen(8080);

app.get("/", (req, res) => {
  res.write(
    "Here is root of this app. Try to make querry on /api/students route."
  );
  res.end();
});

app.get("/api/students", (req, res) => {
  pool.connect((err, client, release) => {
    if (err) {
      return console.error("Error acquiring client", err.stack);
    }
    client.query("SELECT * FROM students", (err, result) => {
      release();
      if (err) {
        return console.error("Error executing query", err.stack);
      }
      res.send(result.rows);
    });
  });
});

app.get("/api/students/:id", (req, res) => {
  pool.connect((err, client, release) => {
    if (err) {
      return console.error("Error acquiring client", err.stack);
    }
    client.query(
      `SELECT * FROM students WHERE "id" = ${parseInt(
        req.url.slice(req.url.indexOf("id:") + 3, req.url.length),
        10
      )}`,
      (err, result) => {
        release();
        if (err) {
          return console.error("Error executing query", err.stack);
        }
        res.send(result.rows);
      }
    );
  });
});

app.post("/api/students", (req, res) => {
  pool.connect((err, client, release) => {
    if (err) {
      return console.error("Error acquiring client", err.stack);
    }

    client.query(
      `INSERT INTO students (first_name, last_name, group_name, created_at, updated_at)
      VALUES ('${req.body.first_name}', '${req.body.last_name}', '${
        req.body.group_name
      }', current_timestamp, current_timestamp);`,
      (err, result) => {
        release();
        if (err) {
          return console.error("Error executing query", err.stack);
        }
        res.send("Added succesfully");
      }
    );
  });
});

app.put("/api/students/:id", (req, res) => {
  let keysValues = "";
  Object.keys(req.body).map(el => {
    keysValues += `'${req.body[el]}', `;
  });
  let keysString = "";
  Object.keys(req.body).forEach(el => {
    keysString += `${el}, `;
  });

  pool.connect((err, client, release) => {
    if (err) {
      return console.error("Error acquiring client", err.stack);
    }
    client.query(
      `UPDATE students SET (${keysString}updated_at) = (${keysValues}current_timestamp) WHERE "id" = ${parseInt(
        req.url.slice(req.url.indexOf("id:") + 3, req.url.length),
        10
      )};`,
      (err, result) => {
        release();
        if (err) {
          return console.error("Error executing query", err.stack);
        }
        res.send("Updated succesfully");
      }
    );
  });
});
app.delete("/api/students/:id", (req, res) => {
  pool.connect((err, client, release) => {
    if (err) {
      return console.error("Error acquiring client", err.stack);
    }
    client.query(
      `DELETE FROM students WHERE "id" = ${parseInt(
        req.url.slice(req.url.indexOf("id:") + 3, req.url.length),
        10
      )};`,
      (err, result) => {
        release();
        if (err) {
          return console.error("Error executing query", err.stack);
        }
        res.send("Deleted succesfully");
      }
    );
  });
});

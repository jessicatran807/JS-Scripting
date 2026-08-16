const pg = require("pg");
const express = require("express");
const path = require("path");
const app = express();

const port = 3000;
const hostname = "localhost";

// const env = require("../env.json");
// const Pool = pg.Pool;
// const pool = new Pool(env);
// pool.connect().then(function () {
//   console.log(`Connected to database ${env.database}`);
// });

app.use(express.static(path.join("public")));
app.use(express.json());

/* serves frontend files and handles backend routing */

app.post("/run", (req, res) => {
  let code = req.body.code;

  let output = [];
  let originalLog = console.log;
  console.log = (value) => {
    output.push(value);
  };

  let errorMessage = null;
  try {
    eval(code);
  } catch (error) {
        errorMessage = error.message;
  }

  console.log = originalLog;

  res.json({ output: output, error: errorMessage });
});

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});

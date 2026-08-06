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

/* serves frontend files and handles backend routing */

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});

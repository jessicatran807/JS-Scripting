let pg = require("pg");
let express = require("express");
let path = require("path");
let cookieParser = require("cookie-parser");
let { createServerClient } = require("@supabase/ssr");
let env = require("../env.json");

let hostname = "localhost";
let port = 3000;

let app = express();
app.use(express.static(path.join("public")));
app.use(express.json());
app.use(cookieParser());

/* serves frontend files and handles backend routing */

// here we create a Supabase client tied to this specific request's cookies
function getSupabaseClient(req, res) {
  return createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return Object.keys(req.cookies).map((name) => ({
          name,
          value: req.cookies[name],
        }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.cookie(name, value, options);
        });
      },
    },
  });
}

app.post("/signup", async (req, res) => {
  let { body } = req;
  let { email, password } = body;
  console.log(email, password);

  let supabase = getSupabaseClient(req, res);

  let signUpResult;
  try {
    signUpResult = await supabase.auth.signUp({ email, password });
  } catch (error) {
    console.log("SIGNUP FAILED", error);
    return res.sendStatus(500);
  }

  let { data, error } = signUpResult;
  if (error) {
    console.log("SIGNUP ERROR", error);
    return res.status(400).json({ error: error.message }); 
  }

  console.log("Signed up", data.user);
  return res.json({ user: data.user });
});

app.post("/login", async (req, res) => {
  let { body } = req;
  let { email, password } = body;
  console.log(email, password);

  let supabase = getSupabaseClient(req, res);

  let loginResult;
  try {
    loginResult = await supabase.auth.signInWithPassword({ email, password });
  } catch (error) {
    console.log("LOGIN FAILED", error);
    return res.sendStatus(500);
  }

  let { data, error } = loginResult;
  if (error) {
    console.log("LOGIN ERROR", error);
    return res.status(400).json({ error: error.message });
  }

  console.log("Logged in", data.user);
  return res.json({ user: data.user });
});

/* middleware; check if Supabase recognizes this request's session, if not, 403 response */
let authorize = async (req, res, next) => {
  let supabase = getSupabaseClient(req, res);

  let userResult;
  try {
    userResult = await supabase.auth.getUser();
  } catch (error) {
    console.log("AUTHORIZE FAILED", error);
    return res.sendStatus(500);
  }

  let { data, error } = userResult;
  console.log(data, error);
  if (error || !data.user) {
    return res.sendStatus(403);
  }

  req.user = data.user;
  next();
};

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
  console.log(`http://${hostname}:${port}`);
});
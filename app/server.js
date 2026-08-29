let pg = require("pg");
let express = require("express");
let path = require("path");
let cookieParser = require("cookie-parser");
let { createServerClient } = require("@supabase/ssr");

process.chdir(__dirname);

let port = process.env.PORT || 3000;
let hostname;
let supabaseUrl, supabaseAnonKey;

if (process.env.NODE_ENV == "production") {
  hostname = "0.0.0.0";
  supabaseUrl = process.env.SUPABASE_URL;
  supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
} else {
  hostname = "localhost";
  let env = require("../env.json");
  supabaseUrl = env.SUPABASE_URL;
  supabaseAnonKey = env.SUPABASE_ANON_KEY;
}

let app = express();
app.use(express.json());
app.use(cookieParser());

/* serves frontend files and handles backend routing */

// here we create a Supabase client tied to this specific request's cookies
function getSupabaseClient(req, res) {
  return createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
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

// in server.js, near /login
app.post("/logout", async (req, res) => {
  let supabase = getSupabaseClient(req, res);
  await supabase.auth.signOut();
  res.sendStatus(200);
});

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

app.post("/api/projects", authorize, async (req, res) => {
  let { name, blocks } = req.body;
  let supabase = getSupabaseClient(req, res);

  let { data, error } = await supabase
    .from("projects")
    .insert({ user_id: req.user.id, name: name, blocks: blocks })
    .select()
    .single();

  if (error) {
    console.log("SAVE PROJECT ERROR", error);
    return res.status(400).json({ error: error.message });
  }

  return res.json({ project: data });
});

app.get("/api/projects", authorize, async (req, res) => {
  let supabase = getSupabaseClient(req, res);

  let { data, error } = await supabase
    .from("projects")
    .select("id, name, created_at")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.log("LIST PROJECTS ERROR", error);
    return res.status(400).json({ error: error.message });
  }

  return res.json({ projects: data });
});

app.get("/api/projects/:id", authorize, async (req, res) => {
  let supabase = getSupabaseClient(req, res);

  let { data, error } = await supabase
    .from("projects")
    .select("id, name, blocks")
    .eq("id", req.params.id)
    .eq("user_id", req.user.id)
    .single();

  if (error) {
    console.log("GET PROJECT ERROR", error);
    return res.status(400).json({ error: error.message });
  }

  return res.json({ project: data });
});

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

app.get("/current-user", authorize, (req, res) => {
  res.json({ user: req.user });
});

app.use(express.static(path.join("public")));

app.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
});
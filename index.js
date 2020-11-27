require("dotenv").config();
const express = require("express");
const { auth, requiresAuth } = require("express-openid-connect");
const morgan = require("morgan");
const asyncHandler = require("express-async-handler");

const debug = require("debug")("traefik-openidconnect");

const app = express();

// https://doc.traefik.io/traefik/middlewares/forwardauth/#forward-request-headers
morgan.token("forwarded-host", function (req, res) {
  return req.header("X-Forwarded-Host");
});
morgan.token("forwarded-uri", function (req, res) {
  return req.header("X-Forwarded-Uri");
});
morgan.token("forwarded-for", function (req, res) {
  return req.header("X-Forwarded-For");
});

app.use(
  morgan(
    ':forwarded-for :forwarded-host :forwarded-uri ":method :url HTTP/:http-version" :status :res[content-length] ":user-agent"'
  )
);

app.use(
  auth({
    authRequired: false,
    idpLogout: true,
    routes: {
      login: "/forward-auth/login",
      logout: "/forward-auth/logout",
      callback: "/forward-auth/callback",
    },
  })
);

app.get("/forward-auth", (req, res) => {
  debug("req");
  res.send(req.headers);
});

app.get("/forward-auth/user", requiresAuth(), (req, res) => {
  res.send(req.oidc.user);
});

app.get("/forward-auth/traefik", requiresAuth(), (req, res) => {
  if (req?.oidc?.user?.email === "pierre.carru@gmail.com") {
    debug("ok");
    res.send("ok");
    return;
  }

  debug("nope");
  res.status(403).send("nope");
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

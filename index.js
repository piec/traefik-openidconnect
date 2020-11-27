require('dotenv').config();
const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const morgan = require('morgan');
const asyncHandler = require('express-async-handler')

const app = express();

morgan.token('type', function (req, res) { return req.header('X-Forwarded-Uri') })
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :type'))

app.use(
  auth({
    authRequired: false,
    idpLogout: true,
    routes: {
      login: '/forward-auth/login',
      logout: '/forward-auth/logout',
      callback: '/forward-auth/callback',
    }
  })
);

app.get('/forward-auth', (req, res) => {
  //console.log(req)
  res.send(req.headers);
});

app.get('/forward-auth/user', requiresAuth(), (req, res) => {
  //res.send(`hello ${req.oidc.user.sub}`);
  res.send(req.oidc.user);
});

app.get('/forward-auth/traefik', requiresAuth(), (req, res) => {
  //console.log(req.headers)
  if (req?.oidc?.user?.email === 'pierre.carru@gmail.com') {
    console.log("ok")
    res.send("ok")
    return
  }

  console.log("nope")
  res.status(403).send("nope")
});

const port = process.env.PORT
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

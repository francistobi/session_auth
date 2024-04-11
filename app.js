require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const bodyParser = require("body-parser");
const userModel = require("./models/user");
const bookroute = require("./routes/store");
const session = require("express-session");
const mongoDB_Url = process.env.mongoDB_Url;

const { connectToMongodb } = require("./db/connect");

const app = express();

app.use(express.json());

// Generate a random secret key
const secret = crypto.randomBytes(32).toString("hex");
app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 }, // 1 hour
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(userModel.createStrategy());

passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

app.set("views", "views");
app.set("view engine", "ejs");

app.use("/books", connectEnsureLogin.ensureLoggedIn(), bookroute);

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/signup", (req, res) => {
  res.render("signup");
});

//handles sign up for new user
app.post("/signup", (req, res) => {
  const user = req.body;
  userModel.register(
    new userModel({ username: user.username }),
    user.password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.status(400).send(err);
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/books");
        });
      }
    }
  );
});

//handle login req for existing user
app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/books");
  }
);
//to handle logout
app.post("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/login");
  });
});

const port = process.env.PORT;

const start = async () => {
  try {
    await connectToMongodb(mongoDB_Url);
    app.listen(port, () => {
      console.log(`Server started successfully at port ${port}...`);
    });
  } catch (error) {
    console.error(error);
  }
};

start();

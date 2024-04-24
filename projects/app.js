let createError = require("http-errors");
let express = require("express");
let path = require("path");
let cookieParser = require("cookie-parser");
let logger = require("morgan");
let bodyParser = require("body-parser");

let db = require("./model/db"),
  project = require("./model/projects");

let routes = require("./routes/index"),
  projects = require("./routes/projects");

let app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.get("/", function (req, res) {
  res.redirect("/projects");
});

app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.use(logger("dev"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", routes);
app.use("/projects", projects);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {},
  });
});

module.exports = app;
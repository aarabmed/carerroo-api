const express = require("express");

const bodyParser = require("body-parser");
const userRoutes = require("./routes/user");
const articleRoute = require("./routes/article");
const accountRoute = require("./routes/account");
const sessionRoute = require("./routes/session");
const categoryRoute = require("./routes/category");
const contactRoute = require("./routes/contact");
const sitemapRoute = require("./routes/sitemap");
const provinceRoute = require("./routes/province");
const cityRoute = require("./routes/city");
const deviceRoute = require("./routes/device");
const appversion = require("./routes/updatecheck");
const notificationRoute = require("./routes/notification"); 
const cors = require("cors");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const whitelist = [
  "http://localhost:9000",
  "http://localhost:3000",
  "http://127.0.0.1:8081",
  "exp://192.168.0.187:19000",
];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use("/api/resources", express.static("resources"));
app.use("/api/account", accountRoute);
app.use("/api/update-check",appversion)
app.use("/api/provinces", provinceRoute);
app.use("/api/cities", cityRoute);
//app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoute);
app.use("/api/articles", articleRoute);
app.use("/api/session", sessionRoute);
app.use("/api/contact", contactRoute);
app.use("/api/sitemap", sitemapRoute);
app.use("/api/device", deviceRoute);
app.use("/api/notifications", notificationRoute);

app.use((req, res, next) => {
  const error = new Error("Page not found");
  error.status = 404;
  next(error);
});
app.use((error, req, res, next) => {
  res.json({
    status: error.status,
    error: {
      message: error.message,
    },
  });
});

module.exports = app;

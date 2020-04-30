const express = require("express");
const path = require("path");
const http = require("http");
const bodyParser = require("body-parser");
const RegistrationController = require('./controller/registration.controller');
const LoginController = require('./controller/login.controller');
const ServicesController = require('./controller/services.controller');
const UserController = require('./controller/user.controller');

const app = express();

// set public dir
app.use(express.static(path.join(__dirname, '../build/')));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(bodyParser.json())

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post('/register', function (req, res) {
    RegistrationController.post(req, res);
});

app.post('/login', function (req, res) {
    if (req.body.step === '1') {
        LoginController.postRequestOne(req, res);
    } else if (req.body.step === '2') {
        LoginController.postRequestTwo(req, res);
    } else {
        res.json({
            status: 500,
            reason: 'invalid request'
        });
    }
});

app.post('/service/save', function (req, res) {
    ServicesController.post(req, res);
});

app.post('/service/delete', function (req, res) {
    ServicesController.post(req, res);
});

app.post('/user/update', function (req, res) {
    if (req.body.step === '1') {
        UserController.postRequestOne(req, res);
    } else if (req.body.step === '2') {
        UserController.postRequestTwo(req, res);
    } else {
        res.json({
            status: 500,
            reason: 'invalid request'
        });
    }
});

http.createServer(app).listen(process.env.PORT ? process.env.PORT : 4500);

module.exports = app;
const express = require("express");

const http = require("http");

const https = require('https');

const bodyParser = require("body-parser");

const RegistrationController = require('./controller/registration.controller');

const LoginController = require('./controller/login.controller');

const ServicesController = require('./controller/services.controller');

const UserController = require('./controller/user.controller');

const fs = require('fs');



const key = fs.readFileSync('/etc/letsencrypt/live/tfprojects.spdns.org/privkey.pem', 'utf8');

const cert = fs.readFileSync('/etc/letsencrypt/live/tfprojects.spdns.org/cert.pem', 'utf8');

const ca = fs.readFileSync('/etc/letsencrypt/live/tfprojects.spdns.org/chain.pem', 'utf8');


const options = {key: key, cert: cert, ca: ca};


const app = express();


app.use(express.json());

app.use(express.urlencoded({ extended: false }));


app.use(bodyParser.json())


app.use(function(req, res, next) {

    res.header("Access-Control-Allow-Origin", "*");

    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    next();

});


app.use (function (req, res, next) {

    if (req.secure) {

            // request was via https, so do no special handling

            next();

    } else {

            // request was via http, so redirect to https

            res.redirect('https://' + req.headers.host + req.url);

    }

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


// set public dir

app.use(express.static('/srv/pwd_manager/build/'), (req, res) => { res.status(404).send('Error 404: Die angefragte Ressource ist nicht verfügbar.'); });


http.createServer(app).listen(80);

https.createServer(options, app).listen(443);


module.exports = app;

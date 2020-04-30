const sendQuery = require('../utilities/mysql');

module.exports = class RegistrationController {

  static async post(req, res) {

    if (!req.body || !req.body.username || !req.body.email || !req.body.salt || !req.body.verifier) {
      res.json({
        status: 500,
        registered: false,
        reason: 'parameters missing'
      });
      return;
    }

    if (!req.body.username.match(/^[a-zA-Z]{0,20}$/)) {
      res.json({
        status: 500,
        registered: false,
        reason: 'username to long'
      });
      return;
    }

    if (!req.body.email.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
      res.json({
        status: 500,
        registered: false,
        reason: 'email format not valid'
      });
      return;
    }

    try {

      const result = await sendQuery(`INSERT INTO user (username, email, salt, verifier) 
            VALUES ('${req.body.username}', '${req.body.email}', '${req.body.salt}', '${req.body.verifier}')`);

      if (result && result.constructor.name === 'OkPacket') {
        res.json({
          status: 200,
          registered: true
        });
      }

    } catch (e) {
      res.json({
        status: 500,
        registered: false,
        reason: e.sqlMessage
      });
    }
  }

}
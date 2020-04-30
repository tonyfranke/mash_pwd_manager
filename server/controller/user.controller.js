const sendQuery = require('../utilities/mysql');
const srp = require('secure-remote-password/server');
const userSessions = require('../users');

const tempUserDataStorage = new Map();

module.exports = class UserController {

  static async postRequestOne(req, res) {

    if (!req.body || !req.body.username || !req.body.mail || !req.body.newSalt || !req.body.currVerifier || !req.body.newVerifier || !req.body.clientPublicEphemeral) {
      res.json({
        status: 500,
        updated: false,
        reason: 'Parameters missing.'
      });
      return;
    }

    if (!req.body.mail.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
      res.json({
        status: 500,
        registered: false,
        reason: 'email format not valid'
      });
      return;
    }

    try {

      const user = await sendQuery(`SELECT id, salt, verifier
        FROM user
        WHERE username LIKE '${req.body.username}';`);

      if (!user || !user[0] || !user[0].id) {
        res.json({
          status: 500,
          stepOneComplete: false,
          success: false,
          reason: 'session not valid'
        });
        return;
      }

      // checks whether the user enters the correct current password.
      if (user[0].verifier !== req.body.currVerifier) {
        res.json({
          status: 200,
          updated: false,
          reason: 'please enter the correct current password'
        });
        return;
      }

      const rows = await sendQuery(`UPDATE user SET
          email = '${req.body.mail}', 
          salt = '${req.body.newSalt}',
          verifier = '${req.body.newVerifier}'
          WHERE username LIKE '${req.body.username}';`);

      if (rows) {

        // console.log(rows);

        // update serverEphemerals and clientEphemerals
        const userData = srp.generateEphemeral(req.body.newVerifier);
        userData.clientPublicEphemeral = req.body.clientPublicEphemeral;
        userData.salt = req.body.newSalt;
        userData.verifier = req.body.newVerifier;
        tempUserDataStorage.set(req.body.username, userData);

        userSessions.set(req.body.username,
          {
            serverSecretEphemeral: userData.secret,
            clientPublicEphemeral: req.body.clientPublicEphemeral
          }
        );

        res.json({
          status: 200,
          stepOneComplete: true,
          serverEphemeral: userData.public
        });
      }
    } catch (e) {
      res.json({
        status: 200,
        stepOneComplete: false,
        reason: e.sqlMessage
      });
    }
  }

  static async postRequestTwo(req, res) {
    
    if (!req.body.username || !tempUserDataStorage.get(req.body.username)) {
      res.json({
        status: 500,
        stepTwoComplete: false
      });
      return;
    }

    const userData = tempUserDataStorage.get(req.body.username);


    try {
      const serverSession = srp.deriveSession(userData.secret, userData.clientPublicEphemeral,
        userData.salt, req.body.username, userData.verifier, req.body.clientSessionProof);

      console.log(serverSession);

      res.json({
        status: 200,
        success: true,
        serverSessionProof: serverSession.proof,
        stepTwoComplete: true
      });



    } catch (e) {
      res.json({
        status: 500,
        stepTwoComplete: false,
        success: false,
        reason: 'Could not verify session'
      });
    }

  }

}
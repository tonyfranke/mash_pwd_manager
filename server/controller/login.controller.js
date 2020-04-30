const sendQuery = require('../utilities/mysql');
const srp = require('secure-remote-password/server');
const userSessions = require('../users');

const tempUserDataStorage = new Map();

module.exports = class LoginController {

	static async postRequestOne(req, res) {

		try {

			const user = await sendQuery(`SELECT id, username, email, salt, verifier
        FROM user 
        WHERE (username LIKE '${req.body.username}' OR email LIKE '${req.body.username}');`);

			if (user && user[0] && user[0].username) {

				const userData = srp.generateEphemeral(user[0].verifier);
				userData.clientPublicEphemeral = req.body.clientPublicEphemeral;
				userData.salt = user[0].salt;
				userData.verifier = user[0].verifier;
				tempUserDataStorage.set(user[0].username, userData);

				userSessions.set(user[0].username,
					{
						serverSecretEphemeral: userData.secret,
						clientPublicEphemeral: req.body.clientPublicEphemeral
					}
				);

				res.json({
					status: 200,
					stepOneComplete: true,
					salt: user[0].salt,
					mail: user[0].email,
					serverEphemeral: userData.public
				});
			} else {
				// TODO: note: if no user cannot be found in the database, a bogus salt and ephemeral value should be returned, to avoid leaking which users have signed up

				res.json({
					status: 500,
					stepOneComplete: false
				});
			}

		} catch (e) {
			res.json({
				status: 500,
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

			const pwd_parameter = await sendQuery(`SELECT * 
                                FROM pwd_parameter 
                                WHERE user_id = (select id from user where username = '${req.body.username}');`);

			// transforms blacklist charCodes to chars
			for (let i = 0; i < pwd_parameter.length; i++) {
				pwd_parameter[i].blacklist = JSON.parse(pwd_parameter[i].blacklist);
				for (let j = 0; j < pwd_parameter[i].blacklist.length; j++) {
					pwd_parameter[i].blacklist[j] = String.fromCharCode(pwd_parameter[i].blacklist[j]);
				}
			}

			if (pwd_parameter) {
				res.json({
					status: 200,
					stepTwoComplete: true,
					serverSessionProof: serverSession.proof,
					services: pwd_parameter
				});
			}
			tempUserDataStorage.delete(req.body.username);
		
		} catch (e) {
			res.json({
				status: 500,
				stepTwoComplete: false,
				reason: 'session cant be verified'
			});
		}
	}

}
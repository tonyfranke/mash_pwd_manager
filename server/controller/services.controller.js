const sendQuery = require('../utilities/mysql');
const srp = require('secure-remote-password/server');
const userSessions = require('../users');

module.exports = class ServicesController {

    static async post(req, res) {

        if (!req.body || !req.body.username || !req.body.name || !req.body.version || !req.body.length || !req.body.rndBytes || !req.body.clientSessionProof) {
            res.json({
                status: 500,
                success: false,
                reason: 'parameters missing'
            });
            return;
        }

        try {

            const user = await sendQuery(`SELECT id, salt, verifier
                FROM user
                WHERE username LIKE '${req.body.username}';`);

            if (user && user[0] && user[0].id) {

                // verifies the clientSessionProof, throws error if proof is invalid
                srp.deriveSession(userSessions.get(req.body.username).serverSecretEphemeral, userSessions.get(req.body.username).clientPublicEphemeral,
                    user[0].salt, req.body.username, user[0].verifier, req.body.clientSessionProof);


                if (req.body.newService) {

                    // transforms blacklist chars to charCode for easier storing
                    for (let i = 0; i < req.body.blacklist.length; i++) {
                        req.body.blacklist[i] = req.body.blacklist[i].charCodeAt(0);
                    }

                    const result = await sendQuery(`SELECT max(id)+1 AS max
                        FROM pwd_parameter
                        WHERE user_id = ${user[0].id};`);

                    if (result && result[0].constructor.name === 'RowDataPacket') {
                        if (result[0].max) {
                            req.body.id = result[0].max;
                        } else {
                            req.body.id = 1;
                        }

                        const rows = await sendQuery(`INSERT INTO pwd_parameter 
                            (user_id, id, name, url, account, version, length, rndBytes, lowercase, uppercase, numbers, specialChars, blacklist, isFavorite) 
                            VALUES (${user[0].id}, ${req.body.id}, '${req.body.name}', '${req.body.url}',
                            '${req.body.account}', ${req.body.version}, ${req.body.length}, '${req.body.rndBytes}', ${req.body.lowercase ? 1 : 0}, 
                            ${req.body.uppercase ? 1 : 0}, ${req.body.numbers ? 1 : 0}, ${req.body.specialChars ? 1 : 0}, '${JSON.stringify(req.body.blacklist)}', ${req.body.isFavorite ? 1 : 0})`);

                        if (rows) {
                            res.json({
                                status: 200,
                                sucess: true,
                                saved: true,
                                id: req.body.id
                            });
                        }
                    }

                } else if (req.body.newService === false) {

                    // transforms blacklist chars to charCode for easier storing
                    for (let i = 0; i < req.body.blacklist.length; i++) {
                        req.body.blacklist[i] = req.body.blacklist[i].charCodeAt(0);
                    }

                    const rows = await sendQuery(`UPDATE pwd_parameter SET 
                            name = '${req.body.name}',
                            url = '${req.body.url}', 
                            account = '${req.body.account ? req.body.account : ''}',
                            version = ${req.body.version},
                            length = ${req.body.length}, 
                            lowercase = ${req.body.lowercase ? 1 : 0}, 
                            uppercase = ${req.body.uppercase ? 1 : 0},
                            numbers = ${req.body.numbers ? 1 : 0}, 
                            specialChars = ${req.body.specialChars ? 1 : 0},
                            blacklist = '${JSON.stringify(req.body.blacklist)}',
                            isFavorite = ${req.body.isFavorite ? 1 : 0}
                            WHERE user_id = ${user[0].id}
                            AND id = ${req.body.id};`);

                    if (rows) {
                        res.json({
                            status: 200,
                            success: true,
                            saved: true
                        });
                    }

                } else if (req.body.delete) {
                    const rows = await sendQuery(`DELETE FROM pwd_parameter WHERE user_id = ${user[0].id} AND id = ${req.body.id};`);

                    if (rows) {
                        res.json({
                            status: 200,
                            success: true,
                            deleted: true
                        });
                    }
                } else {
                    res.json({
                        status: 500,
                        success: false,
                        reason: 'error'
                    });
                }

            } else {
                res.json({
                    status: 500,
                    success: false,
                    reason: 'unknown user'
                });
            }

        } catch (e) {
            res.json({
                status: 500,
                success: false,
                saved: false,
                reason: e.sqlMessage
            });
        }

    }
}
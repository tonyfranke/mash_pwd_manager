const mysql = require("mysql");

module.exports = function sendQuery(queryString) {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'toor',
            database: 'pwd_manager_db',
            multipleStatements: true
        });
        
        connection.connect();
        connection.query(queryString, function (err, rows, fields) {
            if (err) {
                // console.log(err);
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
        connection.end();
    });
}
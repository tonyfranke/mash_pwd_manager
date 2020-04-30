CREATE TABLE user (
    id INT(8) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username varchar(50) UNIQUE NOT NULL ,
    email varchar(100) UNIQUE NOT NULL,
    salt varchar(64) NOT NULL,
    verifier varchar(512) NOT NULL
);

CREATE TABLE pwd_parameter (
    user_id INT(8) UNSIGNED,
    id INT(10) UNSIGNED,
    name varchar(50) NOT NULL,
    url varchar(255),
    account varchar(255),
    version INT(5) NOT NULL,
    length INT(3) NOT NULL,
    rndBytes varchar(32) NOT NULL,
    lowercase BOOLEAN NOT NULL,
    uppercase BOOLEAN NOT NULL,
    numbers BOOLEAN NOT NULL,
    specialChars BOOLEAN NOT NULL,
    blacklist varchar(255),
    PRIMARY KEY (user_id, id),
    FOREIGN KEY (user_id) REFERENCES user(id) 
);
# Mash, a Password Manager based on Master Password Hashing

Mash is a prototype that is based upon our master password hashing method. Furthermore, the prototype is designed to address some reasons for the low acceptance of password management tools by end users.

Mash supports the storing of password parameters and calculation of service passwords using these parameters and the user’s master password. Passwords are always calculated on demand. Mash only stores non-critical password parameters, like the domain name, the length of the password, the version number of the password, and information about the character types that are used to construct the password. These parameters can be stored either locally inside the browser of the user or serverside inside a MySQL database.

Mash was created as a single page application using the React framework. Therefore password calculation is done by the client's computer. The calculated service passwords and the master password of the user are never transmitted to the server that distributes the app.

A demo of the prototype is available through the following GitHub Pages link: \
https://tonyfranke.github.io/mash_pwd_manager/ \
The demo version only contains the Offline mode, which means password parameters can only be stored inside the browsers IndexedDB. The prototype currently only supports Chrome, Firefox, and Safari.


## Setup

### Requirements
- Node
- Express JS
- MySQL database
- React

### MySQL Connection

The MySQL Connection parameters can be changed inside the following file: /server/utilities/mysql.js

### Deployment, Building

The prototype can be deployed by either deploying the /build folder to an Express.js server. Furthermore, you can build the app by using the following react scripts. 

### Available React Scripts

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

#### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.


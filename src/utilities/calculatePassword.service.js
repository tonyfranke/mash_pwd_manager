import * as crypto from 'crypto';
import * as random_seed from 'random-seed';

const CHAR_SET_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const CHAR_SET_CAP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const CHAR_SET_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
const CHAR_SET_SPEC_CHARS = ['!', '"', '#', '$', '%', '&', '`', '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '{', '|', '}', `~`];



export function calculatePassword(masterpassword, service) {
  return new Promise(async (resolve, reject) => {
    let hash = await generatePBKDF2Hash(masterpassword, (service.name + service.account + service.version + service.length + service.rndBytes));

    if (hash) {
      //seedPRNG(hash);
      let pwd = generatePassword(hash, service.length, service.lowercase, service.uppercase, service.numbers, service.specialChars, service.whitelist, service.blacklist);
      resolve(pwd.join(''));
    }
  });
}

function generatePBKDF2Hash(masterpassword, salt) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(masterpassword, salt, 100000, 128, 'sha256', (err, hash) => {
      if (err) {
        resolve(null);
      }
      resolve(hash);
    });
  });
}

function removeBlacklistedChars(blacklist, charSet) {
  for (const iterator of blacklist) {
    charSet.splice(charSet.indexOf(iterator), 1)
  }
}

function generatePassword(hash, length, lowercase, uppercase, numbers, specialChars, whitelist, blacklist) {
  let rand = random_seed(hash);
  let template = createTemplate(length, lowercase, uppercase, numbers, specialChars, rand);
  let charSet = createCharSet(lowercase, uppercase, numbers, specialChars);

  removeBlacklistedChars(blacklist, charSet);

  for (let i = 0; i < template.length; i++) {
    let rng = rand.random();
    switch (template[i]) {
      case '':
        template[i] = charSet[Math.floor(rng * charSet.length)];
        break;
      case 'lc':
        template[i] = CHAR_SET_LETTERS[Math.floor(rng * CHAR_SET_LETTERS.length)];
        break;
      case 'uc':
        template[i] = CHAR_SET_CAP_LETTERS[Math.floor(rng * CHAR_SET_CAP_LETTERS.length)];
        break;
      case 'num':
        template[i] = CHAR_SET_NUMBERS[Math.floor(rng * CHAR_SET_NUMBERS.length)];
        break;
      case 'sc':
        template[i] = whitelist[Math.floor(rng * whitelist.length)];
        break;
      default:
        break;
    }
  }

  return template
}

function createTemplate(length, lowercase, uppercase, numbers, specialChars, rand) {
  const template = new Array(length);

  for (let i = 0; i < template.length; i++) {
    template[i] = '';
  }

  if (lowercase) {
    let rng = rand.random();
    while (template[Math.floor(rng * length)] !== '') {
      rng = rand.random();
    }

    if (template[Math.floor(rng * length)] === '') {
      template[Math.floor(rng * length)] = 'lc';
    }
  }

  if (uppercase) {
    let rng = rand.random();
    while (template[Math.floor(rng * length)] !== '') {
      rng = rand.random();
    }

    if (template[Math.floor(rng * length)] === '') {
      template[Math.floor(rng * length)] = 'uc';
    }
  }

  if (numbers) {
    let rng = rand.random();
    while (template[Math.floor(rng * length)] !== '') {
      rng = rand.random();
    }

    if (template[Math.floor(rng * length)] === '') {
      template[Math.floor(rng * length)] = 'num';
    }
  }

  if (specialChars) {
    let rng = rand.random();
    while (template[Math.floor(rng * length)] !== '') {
      rng = rand.random();
    }

    if (template[Math.floor(rng * length)] === '') {
      template[Math.floor(rng * length)] = 'sc';
    }
  }

  return template;
}

function createCharSet(lowercase, uppercase, numbers, specialChars) {
  let charSet = [];

  if (lowercase) {
    charSet = charSet.concat(CHAR_SET_LETTERS);
  }

  if (uppercase) {
    charSet = charSet.concat(CHAR_SET_CAP_LETTERS);
  }

  if (numbers) {
    charSet = charSet.concat(CHAR_SET_NUMBERS);
  }

  if (specialChars) {
    charSet = charSet.concat(CHAR_SET_SPEC_CHARS);
  }

  if (!lowercase && !uppercase && !numbers && !specialChars) {
    charSet = charSet.concat(CHAR_SET_LETTERS);
  }

  return charSet;
}
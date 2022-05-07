var database;

export function openDatabase() {
  return new Promise((resolve, reject) => {
    // IndexedDB setup / store data
    if (!window.indexedDB) {
      reject();
    }

    let db;
    let request = window.indexedDB.open('services', 1);

    request.onerror = function (event) {
      console.log("error: ");
      reject();
    };

    request.onsuccess = function (event) {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = function (event) {
      db = event.target['result'];

      db.createObjectStore('service', { keyPath: "id", autoIncrement: true });
    }

  });
}

export function storeService(service) {
  return new Promise((resolve, reject) => {
    let storeRequest = database.transaction(['service'], "readwrite")
      .objectStore('service')
      .put(service);

    storeRequest.onsuccess = function (event) {
      resolve(event.target.result);
    };

    storeRequest.onerror = function (event) {
      console.error('error.');
      reject();
    }
  });
}

export function readServices() {
  return new Promise((resolve, reject) => {
    let objectStore = database.transaction('service').objectStore('service');
    let services = [];

    objectStore.openCursor().onsuccess = function (event) {
      let cursor = event.target.result;

      if (cursor) {
        let service = {
          id: cursor.key,
          name: cursor.value.name,
          url: cursor.value.url,
          account: cursor.value.account,
          version: cursor.value.version,
          length: cursor.value.length,
          rndBytes: cursor.value.rndBytes,
          lowercase: cursor.value.lowercase,
          uppercase: cursor.value.uppercase,
          numbers: cursor.value.numbers,
          specialChars: cursor.value.specialChars,
          whitelist: cursor.value.whitelist,
          blacklist: cursor.value.blacklist,
          isFavorite: cursor.value.isFavorite || false
        };

        services.push(service);
        cursor.continue();
      } else {
        resolve(services);
      }
    };
  });
}

export function deleteService(key) {
  return new Promise((resolve, reject) => {
    const request = database.transaction(['service'], "readwrite")
      .objectStore('service')
      .delete(key);

    request.onsuccess = function (event) {
      resolve(true);
    };

    request.onerror = function (event) {
      reject();
    };
  });
}

export function getDatabase() {
  return database;
}

export function setDatabase(db) {
  database = db;
}

import * as axios from 'axios';

export function sendPostRequest(url, body) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.post(url, body,
        { headers: { 'Content-Type': 'application/json' } }
      )

      if (response && response.data && response.data.success) {
        resolve(response.data);
      } else {
        reject('response not successful');
      }
    } catch (e) {
      reject('error', e);
    }
  });
}

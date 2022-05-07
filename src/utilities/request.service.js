import * as axios from 'axios';

export function sendPostRequest(url, body) {
  return new Promise(async (resolve, reject) => {
    try {
      url = process.env.NODE_ENV === 'production' ? url : 'http://localhost:4500' + url
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

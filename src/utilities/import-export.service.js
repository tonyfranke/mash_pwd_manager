export function exportServices(services) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(services));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', dataStr);
  downloadAnchorNode.setAttribute('download', 'services.json');
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

export function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.readAsBinaryString(file);
    reader.onload = () => {
      const fileContent = reader.result;
      resolve(JSON.parse(fileContent));
    };
    reader.onerror = () => {
      reject();
    }
  });
}


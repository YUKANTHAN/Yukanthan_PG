const { fromPath } = require('pdf2pic');

async function generatePreview() {
  const options = {
    density: 200,
    saveFilename: 'symbo-yukanthan',
    savePath: './public/certificates',
    format: 'png',
    width: 1200,
    height: 800
  };

  const store = fromPath('./public/certificates/symbo-yukanthan.pdf', options);
  const result = await store(1);
  console.log('Generated:', result.path);
}

generatePreview().catch(console.error);
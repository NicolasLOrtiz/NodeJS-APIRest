const fs = require('node:fs');
const { parse } = require('csv-parse');
const path = require('node:path');

const csvPath = path.resolve(__dirname, 'tasks.csv');

const stream = fs.createReadStream(csvPath);

const csvParse = parse({
  delimiter: ',',
  skipEmptyLines: true,
  fromLine: 2 // skip header
});

async function run() {
  const linesParse = stream.pipe(csvParse);

  for await (const line of linesParse) {
    const [title, description] = line;

    await fetch('http://localhost:3333/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
      })
    })

    // To simulate a delay similar to the stream example if desired (optional)
    // await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

run().then(() => {
    console.log('Importação do CSV concluída!');
});

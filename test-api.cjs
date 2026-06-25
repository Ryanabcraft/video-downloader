const http = require('http');

const data = JSON.stringify({
  url: 'https://shopee.com.br/Conjunto-Camiseta-UV-Manga-Comprida-e-Sunga-Com-Cordao-Juvenil-Tamanho-10-ao-16-i.367379535.57609794773'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/download',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Resposta:', body);
  });
});

req.on('error', (e) => console.error('Erro:', e.message));
req.write(data);
req.end();

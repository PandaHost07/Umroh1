const http = require('http');

async function test() {
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  let body = '';
  const obj = {
    id: 'paket-regular-1',
    nama: 'Testing Update',
    deskripsi: 'testing',
    tanggalBerangkat: new Date().toISOString(),
    tanggalPulang: new Date().toISOString(),
    harga: 25000000,
    kuota: 45,
    hotelId: 'clh123...', // wait I need a valid hotelId! 
    penerbanganId: 'clp123...' 
  };
  
  // I will just fetch the current paket first!
  const resGet = await fetch('http://localhost:3000/api/system/paket?id=paket-regular-1');
  const d = await resGet.json();
  
  obj.hotelId = d.hotelId;
  obj.penerbanganId = d.penerbanganId;
  
  body += '--' + boundary + '\r\n';
  body += 'Content-Disposition: form-data; name="form"\r\n\r\n';
  body += JSON.stringify(obj) + '\r\n';
  body += '--' + boundary + '--\r\n';

  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/system/paket',
    method: 'PATCH',
    headers: {
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      'Content-Length': Buffer.byteLength(body)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('RESPONSE:', res.statusCode, data));
  });

  req.on('error', console.error);
  req.write(body);
  req.end();
}

test();

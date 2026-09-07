const { POST } = require('./.next/server/app/api/v1/products/import-url/route.js');

async function run() {
  const req = {
    json: async () => ({ url: 'https://www.amazon.in/dp/B0GXBG2MNF' }),
    headers: new Headers({ 'x-forwarded-for': '127.0.0.1' }),
  };
  try {
    const res = await POST(req);
    const text = await res.text();
    console.log(res.status, text);
  } catch (e) {
    console.error(e);
  }
}
run();

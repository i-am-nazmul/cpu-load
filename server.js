import { createServer } from './src/app.js';

const port = Number(process.env.PORT || 3000);
const host = '0.0.0.0';

const server = createServer();

server.listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port}`);
});

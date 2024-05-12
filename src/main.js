import app from './app.js';

const port = process.env.PORT || 3001;
const host = 'localhost';

app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});

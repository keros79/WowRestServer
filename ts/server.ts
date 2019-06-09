import App from './App';

try {
  App.instance().start();
} catch (err) {
  console.log(err.message)
}

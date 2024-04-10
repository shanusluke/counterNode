const { parentPort, workerData } = require('worker_threads');
const { Client } = require('pg');

const counter = workerData.counter;
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "TestDB",
  password: "1234",
  port: 5432 
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL database from worker thread'))
  .catch(err => console.error('Error connecting to PostgreSQL database from worker thread', err));




client.query('INSERT INTO dataset (counter_value) VALUES ($1)', [counter])
  .then(() => {
    console.log('Counter value inserted into database from worker thread');
    parentPort.postMessage({ message: 'Counter value inserted into database' });
    client.end(); 
  })
  .catch(err => {
    console.error('Error inserting counter value into database from worker thread', err);
    parentPort.postMessage({ error: 'Error inserting counter value into database' });
    client.end(); 
  });

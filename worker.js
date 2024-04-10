const { parentPort, workerData } = require("worker_threads");
const { Client } = require("pg");

const count = workerData.count; // get the count value passed from main thread

// Create a new PostgreSQL client
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "TestDB",
  password: "1234",
  port: 5432,
});

// Connect to the PostgreSQL database
client
  .connect()
  .then(() =>
    console.log("Connected to PostgreSQL database from worker thread")
  )
  .catch((err) =>
    console.error(
      "Error connecting to PostgreSQL database from worker thread",
      err
    )
  );

// Execute the SQL query
client
  .query("INSERT INTO dataset (counter_value) VALUES ($1)", [count])
  .then(() => {
    console.log("Counter value inserted into database from worker thread");
    parentPort.postMessage({ message: "Counter value inserted into database" });
    client.end();
  })
  .catch((err) => {
    console.error(
      "Error inserting counter value into database from worker thread",
      err
    );
    parentPort.postMessage({
      error: "Error inserting counter value into database",
    }); // Send an error message to the parent port
    client.end(); // Close the database connection
  });

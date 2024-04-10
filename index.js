const express = require("express");
const { Worker } = require("worker_threads");

const app = express(); // create an express application
const port = 3000;

// route for the home page
app.get("/", (req, res) => {
  // Send a HTML response with a counter and a button to add the counter value to the database
  res.status(200).send(
    ` <html>
      <head>
        <title>Counter</title>
      </head>
      <body>
        <h1 id="counter">0</h1>
        <button onclick="addToDatabase()">Add Counter to Database</button>
        <script>
          let count = 0;
          const counter = document.querySelector("#counter");

        //   Increment the counter every second
          setInterval(() => {
            count++;
            counter.innerText = count;
          }, 1000);

          // Function to add the counter value to the database
          function addToDatabase() {
            fetch('/insert?count=' + count)
              .then(response => response.json())
              .then(data => {
                alert(data.message);
              })
              .catch(error => {
                console.error('Error adding counter to database:', error);
                alert('Error adding counter to database. See console for details.');
              });
          }
        </script>
      </body>
    </html>
  `
  );
});

// Define the route to insert the counter value into the database
app.get("/insert", (req, res) => {
    
  const count = parseInt(req.query.count); // Parse the count value from the query parameters

 // Create a new worker thread
  const worker = new Worker("./worker.js", { workerData: { count } });

   // Handle the message event from the worker thread
  worker.on("message", (message) => {
    console.log(message);
    res.status(200).json({ message: "Counter value inserted into database" });
  });

   // Handle the error event from the worker thread
  worker.on("error", (error) => {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  });

   // Handle the exit event from the worker thread
  worker.on("exit", (code) => {
    if (code !== 0) {
      console.error(`Worker stopped with exit code ${code}`);
    }
  });
});

// Start the Express application
app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});

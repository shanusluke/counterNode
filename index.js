const express = require("express");
const { Worker } = require("worker_threads");

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.status(200).send(`
    <html>
      <head>
        <title>Counter</title>
      </head>
      <body>
        <h1 id="counter">0</h1>
        <button onclick="addToDatabase()">Add Counter to Database</button>
        <script>
          let count = 0;
          const counter = document.querySelector("#counter");

          setInterval(() => {
            count++;
            counter.innerText = count;
          }, 1000);

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
  `);
});

app.get("/insert", (req, res) => {
    const count = parseInt(req.query.count);
    console.log("Count value received:", count); // Add this line for debugging
    const worker = new Worker("./worker.js", { workerData: { count } });
    
    worker.on("message", (message) => {
        console.log(message);
        res.status(200).json({ message: "Counter value inserted into database" });
    });

    worker.on("error", (error) => {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    });

    worker.on("exit", (code) => {
        if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}`);
        }
    });
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});

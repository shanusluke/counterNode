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
        <h1 id= 'counter'> ${counter}</h1>
        <button onclick="addToDatabase()">Add Counter to Database</button>
        <script>
          function addToDatabase() {
            fetch('/insert')
              .then(response => response.json())
              .then(data => {
                alert(data.message);
              })
              .catch(error => {
                console.error('Error adding counter to database:', error);
                alert('Error adding counter to database. See console for details.');
              });
          }

       var counter = document.querySelector("#counter");

       var count = 1;
       setInterval(() => {
        count++;
        counter.innerText = 'Counter value: '+ count;
       },1000)
        </script>
      </body>
    </html>
  `);
});

app.get("/insert", (req, res) => {
    const worker = new Worker("./worker.js", { workerData: { counter } });
    
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

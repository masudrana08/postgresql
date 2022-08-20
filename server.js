const express = require("express");
const cors = require("cors");
const { Client } = require("pg");
const pool = require("./db");
const PORT = process.env.PORT || 9999;
const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const client = new Client({
  host: "localhost",
  user: "postgres",
  password: "1111",
  port: 5432,
  database: 'perntodo'
});

const createDatabase = async (dbname) => {
  try {
    await client.connect(); 
    const dbQuery = await client.query(
      `SELECT FROM pg_database WHERE datname = $1`,
      [dbname]
    );
    if (dbQuery.rowsCount === 0) {
      await client.query(`CREATE DATABASE ${dbname}`);
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS "todo"(
        todo_id SERIAL PRIMARY KEY,
        description VARCHAR(255)
      )
    `)
    return true;
  } catch (error) {
    console.error(error.stack);
    return false;
  } finally {
    await client.end(); 
  }
};
createDatabase('perntodo').then((result) => {
  if (result) console.log("Database created");
});


app.post("/todo", async (req, res) => {
  const { description } = req.body;
  console.log(description);
  const newTodo = await pool.query(
    "INSERT INTO todo (description) VALUES($1) RETURNING *",
    [description]
  );
  res.send(newTodo);
});

app.get("/todo", async (req, res)=>{
  const data = await pool.query("SELECT * FROM todo")
  res.send(data)
})
app.put("/todo", async (req, res)=>{
  const {id, description} = req.query
  const data = await pool.query(`UPDATE todo SET description=$1 WHERE todo_id=$2 Returning *`, [description, id])
  res.send(data)
})
app.delete("/todo", async (req, res)=>{
  const {id} = req.query
  const data = await pool.query(`DELETE FROM todo WHERE todo_id=$1 Returning *`, [id])
  res.send(data)
})

app.listen(PORT, () => {
  console.log("Server is running with port: ", PORT);
});

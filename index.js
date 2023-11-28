const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const app = express();
const port = 3000;
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'kino',
  password: '123123',
  port: 5432,
});
app.use(bodyParser.json());
app.get('/films', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM films');
    res.json(rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/film', async (req, res) => {
  const { title, year, description } = req.body;
  if (!title || !year || !description) {
    return res.status(400).json({ error: 'Пожалуйста, укажите все поля фильма.' });
  }
  try {
    const queryText = 'INSERT INTO films (title, year, description) VALUES ($1, $2, $3) RETURNING *';
    const values = [title, year, description];
    const { rows } = await pool.query(queryText, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/film/:id', async (req, res) => {
  const filmId = req.params.id;
  try {
    const { rows } = await pool.query('SELECT * FROM films WHERE id = $1', [filmId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Фильм не найден' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

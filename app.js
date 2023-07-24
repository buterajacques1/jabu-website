const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const dbConfig = {
    host: 'localhost',
    user: 'user1',
    database: 'fashion_shop',
    password: 'pass', // Replace with the actual password
    port: 8889, // MAMP's MySQL port is 8889
  };

const pool = mysql.createPool(dbConfig);

// Test the database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database successfully!');
    connection.release();
  }
});

app.get('/products', (req, res) => {
  pool.query('SELECT * FROM products', (error, results) => {
    if (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    return res.json(results);
  });
});

app.get('/products/:id', (req, res) => {
  const productId = req.params.id;
  pool.query('SELECT * FROM products WHERE id = ?', [productId], (error, results) => {
    if (error) {
      console.error('Error fetching product:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json(results[0]);
  });
});

app.post('/products', (req, res) => {
  const { name, price, description } = req.body;

  if (!name || !price || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  pool.query('INSERT INTO products (name, price, description) VALUES (?, ?, ?)', [name, price, description], (error, results) => {
    if (error) {
      console.error('Error creating product:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    return res.status(201).json({ message: 'Product created successfully' });
  });
});

app.put('/products/:id', (req, res) => {
  const productId = req.params.id;
  const { name, price, description } = req.body;

  if (!name || !price || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  pool.query('UPDATE products SET name = ?, price = ?, description = ? WHERE id = ?', [name, price, description, productId], (error, results) => {
    if (error) {
      console.error('Error updating product:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    return res.json({ message: 'Product updated successfully' });
  });
});

app.delete('/products/:id', (req, res) => {
  const productId = req.params.id;
  pool.query('DELETE FROM products WHERE id = ?', [productId], (error, results) => {
    if (error) {
      console.error('Error deleting product:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    return res.json({ message: 'Product deleted successfully' });
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error('Error occurred:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

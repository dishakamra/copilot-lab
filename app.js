// build a CRUD API for products
const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());

let products = [];
// Create a product
app.post('/products', (req, res) => {
    const { name, price } = req.body;
    const id = products.length + 1;
    const product = { id, name, price };
    products.push(product);
    res.status(201).send(product);
});
// Read all products
app.get('/products', (req, res) => {
    res.send(products);
});
// Read a single product
app.get('/products/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).send('Product not found');
    res.send(product);
});
// Update a product
app.put('/products/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).send('Product not found');
    const { name, price } = req.body;
    if (name) product.name = name;
    if (price) product.price = price;
    res.send(product);
});
// Delete a product
app.delete('/products/:id', (req, res) => {
    const index = products.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).send('Product not found');
    const deletedProduct = products.splice(index, 1)[0];
    res.send(deletedProduct);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

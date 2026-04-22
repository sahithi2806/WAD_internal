const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());
app.use(express.static('frontend'));

const DB = 'products.json';

function save() { fs.writeFileSync(DB, JSON.stringify(products, null, 2)); }

let products = JSON.parse(fs.readFileSync(DB, 'utf8') || '[]');
let nextId = products.length ? Math.max(...products.map(p=>p.id)) + 1 : 1;

// Initial data if empty
if (!products.length) {
  products = [{id:1,name:'Laptop',price:1000,quantity:5,description:'High-performance laptop'}];
  nextId = 2;
  save();
}

app.get('/api/products', (req, res) => res.json({success:true, data:products}));

app.get('/api/products/:id', (req, res) => {
  const p = products.find(p=>p.id==req.params.id);
  p ? res.json({success:true, data:p}) : res.status(404).json({success:false, message:'Not found'});
});

app.post('/api/products', (req, res) => {
  const {name, price, quantity, description} = req.body;
  if (!name || price==null || quantity==null) return res.status(400).json({success:false, message:'Missing fields'});
  const newP = {id:nextId++, name, price:+price, quantity:+quantity, description:description||''};
  products.push(newP);
  save();
  res.status(201).json({success:true, data:newP});
});

app.put('/api/products/:id', (req, res) => {
  const p = products.find(p=>p.id==req.params.id);
  if (!p) return res.status(404).json({success:false, message:'Not found'});
  Object.assign(p, req.body);
  save();
  res.json({success:true, data:p});
});

app.delete('/api/products/:id', (req, res) => {
  const i = products.findIndex(p=>p.id==req.params.id);
  if (i<0) return res.status(404).json({success:false, message:'Not found'});
  const deleted = products.splice(i,1)[0];
  products.forEach((p,i) => p.id = i+1);
  nextId = products.length + 1;
  save();
  res.json({success:true, data:deleted});
});

app.listen(3000, () => console.log('Server: http://localhost:3000'));


import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import fs from 'fs'
import { fileURLToPath } from 'url';

const app = express();
const port = 3000
 const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.use('/uploads', express.static('uploads')); 

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save images to uploads folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Store posts temporarily in memory (can replace with DB later)
let posts = [];

app.get("/", (req, res) => {
  
    res.render("index", { posts })

})
app.get('/post', (req, res) => {
  res.render('post');  
});

app.get('/pricing', (req, res) => {
  res.render('pricing');  
});
app.get('/upload', (req, res) => {
  res.render('upload');  
});

app.post('/upload', upload.single('photo'), (req, res) => {
  const { title, content } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  // Save the post data
  const newPost = { id: Date.now(), title, content, imageUrl, date: new Date() };
  posts.push(newPost);

  // Redirect to the posts page
  res.redirect('/');
});

app.post('/delete/:id', (req, res) => {
  const postId = Number(req.params.id); // Convert to number
  posts = posts.filter(post => post.id !== postId); // Remove the post with the matching ID
  res.redirect('/'); // Redirect to home page
});

app.get('/edit/:id', (req, res) => {
  const postId = Number(req.params.id); // Get post ID from URL
  const post = posts.find(post => post.id === postId); // Find the post to edit

  if (!post) {
    return res.status(404).send('Post not found'); // Handle case where post doesn't exist
  }

  res.render('edit', { post }); // Render edit form with post data
});

app.post('/edit/:id', upload.single('photo'), (req, res) => {
  const postId = Number(req.params.id);
  const { title, content } = req.body;
  const post = posts.find(post => post.id === postId);

  if (!post) {
    return res.status(404).send('Post not found');
  }

  // Update the post's data
  post.title = title;
  post.content = content;

  // If a new image is uploaded, update the image URL
  if (req.file) {
    post.imageUrl = `/uploads/${req.file.filename}`;
  }

  res.redirect('/'); // Redirect to the home page after updating
});


app.get("/posts", (req, res) => {
  res.render("posts", { posts }); // Render the posts view with the posts array
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
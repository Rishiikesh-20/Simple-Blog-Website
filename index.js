
import express from "express";
import bodyParser from "body-parser";
import path from "path";
import multer from "multer";
import { dirname } from "path";
import { fileURLToPath } from "url";

let i = 0;
const app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');

const __dirName = dirname(fileURLToPath(import.meta.url));
const port = 3000;
let arr = [];

function PostObj(sentence, time, user, userPic) {
    this.sentence = sentence;
    this.time = new Date(time).toLocaleString();
    this.user = user;
    this.id = i++;
    this.edited = false;
    this.userPic = userPic;
}

let username = "Rishiikesh";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, `profile_${uniqueSuffix}`);
    }
});

const upload = multer({ storage: storage });
let userProfilePic = '/uploads/default_profile.png';

app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    console.log(`Request Method: ${req.method}, Path: ${req.path}`);
    console.log('Request Body:', req.body);
    next();
});

app.get("/", (req, res) => {
  arr=[];
  i=0;
  res.sendFile(__dirName + '/public/login.html');
});

app.get("/home", (req, res) => {
    res.render('homePage1.ejs', {
        arr: arr,
        image: userProfilePic,
        user: username
    });
});

app.get("/create", (req, res) => {
    res.render('create.ejs', {
        image: userProfilePic,
        user: username
    });
});

app.post('/edit', (req, res) => {
    const element = parseInt(req.body.id, 10);
    console.log('Edit request for post ID:', element);
    console.log('Current posts:', arr);

    if (isNaN(element) || element < 0 || element >= arr.length) {
        return res.status(404).send('Post not found');
    }

    res.render('edit.ejs', {
        p: arr[element],
        image: userProfilePic,
        user: username
    });
});

app.post('/update', (req, res) => {
    const element = parseInt(req.body.id, 10);
    console.log('Updating post ID:', element);
    console.log('New content:', req.body.contentBox);

    if (isNaN(element) || element < 0 || element >= arr.length) {
        return res.status(404).send('Post not found');
    }
    if (arr[element]) {
        arr[element].sentence = req.body.contentBox;
        arr[element].time = new Date().toLocaleString();
        arr[element].edited = true;

        console.log('Updated post:', arr[element]);
    } else {
        console.error('Post not found at index:', element);
        return res.status(404).send('Post not found');
    }

    res.render('homePage1.ejs', {
        arr: arr,
        image: userProfilePic,
        user: username
    });
});

app.post('/create', (req, res) => {
    const newPost = new PostObj(
        req.body.contentBox, 
        new Date().getTime(), 
        username, 
        userProfilePic
    );
    
    console.log('Creating new post:', newPost);
    arr.push(newPost);

    res.render('homePage1.ejs', {
        arr: arr,
        image: userProfilePic,
        user: username
    });
});

app.post('/login', upload.single('image'), (req, res) => {
    username = req.body.text;

    if (req.file) {
        userProfilePic = `/uploads/${req.file.filename}`;
    }
    arr=[];
    res.render('homePage1.ejs', {
        user: username,
        image: userProfilePic,
        arr: arr
    });
});

app.post('/delete', (req, res) => {
    const index = parseInt(req.body.id, 10);
    if (!isNaN(index) && index >= 0 && index < arr.length) {
      arr.splice(index, 1);
      console.log('Post deleted. Remaining posts:', arr.length);
    }
    
    console.log('Deleting post with ID:', index);
    i--;
    for(let j=index;j<i;j++){
      arr[j].id=arr[j].id-1;
    }
    

    res.render('homePage1.ejs', {
        user: username,
        image: userProfilePic,
        arr: arr
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
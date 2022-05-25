const express = require('express')
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const campground = require('./models/campground');



mongoose.connect('mongodb://localhost:27017/yelp-camp')
.then(()=>{console.log("connection established")})
.catch((err)=>{console.log(err);})

// const db = mongoose.connection;
// db.on('error',console.error.bind(console.log('connection error:')));
// db.once('open',()=>{
//     console.log('Database connected')
// })



app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(express.urlencoded({extended:true}))

app.get('/',(req,res)=>{
    res.render('home')
})

app.get('/campgrounds',async(req,res)=>{
    const campgrounds = await campground.find({});
    res.render('campgrounds/index',{campgrounds})
})

app.get('/campgrounds/new',(req,res)=>{
    res.render('campgrounds/new')
})
app.post('/campgrounds',async(req,res)=>{
const newCampground = new campground(req.body.campground);
await newCampground.save();
res.redirect(`/campgrounds/${newCampground._id}`
)
})
// app.get('/views/edit',(req,res)=>{
//     console.log("targeted");
//     res.render('edit')
// })
app.get('/campgrounds/:id',async(req,res)=>{
    const campgroundShow = await campground.findById(req.params.id)
    res.render('campgrounds/show',{campgroundShow});
})

app.get('/campgrounds/:id/edit',async(req,res)=>{
    const campgroundEdit = await campground.findById(req.params.id)
    res.render('campgrounds/edit',{campgroundEdit});
})

app.listen(3000, ()=>{
    console.log('Server on port 3000')
})
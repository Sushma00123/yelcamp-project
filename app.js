const express = require('express')
const app = express();
const path = require('path')
const {campgroundSchema,reviewSchema} = require('./schemas.js')
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const methodOverride = require('method-override')
const Campground = require('./models/campground');
const Review = require('./models/review')



mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


const db = mongoose.connection;
db.on('error', console.error.bind(console.log('connection error:')));
db.once('open', () => {
    console.log('Database connected')
})


app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

const validateCampground = (req,res,next)=>{
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400)
    }else{

    next()
}
   
}

const validateReview = (req,res,next)=>{
const {error} = reviewSchema.validate(req.body);
console.log(error)
if(error){
    console.log(error)
    const msg = error.details.map(el=>el.message).join(',')
    throw new ExpressError(msg,400)
}else{

next()
}
}

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
})

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

app.post('/campgrounds',validateCampground, catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid campground data')
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)

}))

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews')
    res.render('campgrounds/show', { campground });
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}))



app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

app.post('/campgrounds/:id/reviews',validateReview ,catchAsync(async(req,res)=>{
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review)
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
}))


app.all('*', (req, res, next) => {
    next(new ExpressError('page not found', 404))
})//for every request this call back will execute

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'something went wrong'
    res.status(statusCode).render('error', { err })
    // res.send('Oh boy,something went wrong!');
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})
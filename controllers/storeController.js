const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
//allows us to resize photos
const jimp = require('jimp');
//unique identifier package
const uuid = require('uuid')

  
//where will the file be stored when its uploaded, and what types of files are allowed
const multerOptions = {
  //read photo into storage
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto) {
      //if its not an err, continue on
      next(null, true)
    } else {
      next({ message: 'That filetype isn\'t allowed'}, false)
    }
  }
}

exports.homePage = (req, res) => {
  res.render('index')     
}

exports.addStore = (req, res) => {
  res.render('editStore', {title: 'Add store'});
};

//stores in memory of server, doesn't read to disc
exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next)  => { 
  if(!req.file) {
    next(); // skip to next middleware
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`
  //now we resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  //once we have written the photo to our filesystem, keep going
  next();
}
 
exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save()
  req.flash('success', `Successfully created ${store.name}. Care to leave a review?`);
  res.redirect(`/store/${store.slug}`)
}; 

exports.getStores = async (req, res) => {
  //1. query database for list of all stores
  const stores = await Store.find();
  console.log(stores)
  res.render('stores', {title: 'Stores', stores});
};

exports.editStore = async (req, res) => {
  //1. find the store given the id
  const store = await Store.findOne({_id: req.params.id}) 
  //2. confirm they are the owner of the store
  //TODO
  //3. render the edit form so the user can update
  res.render('editStore', {title: `Edit ${store.name }`, store})
};

exports.updateStore = async (req, res) => {
  //set the location data to be a point
  req.body.location.type = 'Point';
  //find and update store in the DB
  const store = await Store.findOneAndUpdate({_id: req.params.id}, req.body, 
    {
    new: true, // return new store, not old one 
    runValidators: true
  }).exec();
  req.flash('success', `Sucessfully updated <strong>${store.name}</strong>.
  <a href="stores/${store.slug}">View Store</a>`);
  res.redirect(`/stores/${store._id}/edit`);
  //redirect them to the store and tell them it worked    
};



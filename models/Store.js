const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name!'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates!'
    }],
    address: {
      type: String,
      required: 'You must supply an address!'
    }
  },
  photo: String,
  author: {
    //type === object id
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author'
  }
}, {
  toJson: {virtuals: true},
  toObject: {virtuals: true}
});

//define our indexes : here we want name and description
//make text  --> we can efficiently search within that 
storeSchema.index({
  name: 'text',
  description: 'text'
})

//define location as geospatial: store metadata as geospatial, quickly search it
storeSchema.index({location: '2dsphere'})


storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next(); // skip it
    return; // stop this function from running
  }
  this.slug = slug(this.name);
  // Make slugs unique: find other stores that have a slug of wes, make into wes-1, wes-2 etc.
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }
  next();
});

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
}

storeSchema.statics.getTopStores = function() {
  //aggregate is a query function, but for complex queries
  return this.aggregate([
    //look up stores and populate reviews
    { $lookup: {from: 'reviews', localField: '_id', 
      foreignField: 'store', as: 'reviews'}},
    //filter for only items that have 2+ reviews
    { $match: { 'reviews.1': {$exists: true}}}, 
    //add the average reviews field
    { $project: {
      //mongodb v3.4: just use ADDFIELD
      //create a new field called avgrating. set avg to each of reviews rating field (does the math for us)
      photo: '$$ROOT.photo',
      name: '$$ROOT.name',
      reviews: '$$ROOT.reviews', 
      slug: '$$ROOT.slug',
      averageRating: { $avg: '$reviews.rating'}
    }},
    //sort by new field, highest reviews first
    { $sort: {averageRating: -1 }},
    //limit to 10 at most
    { $limit: 10}
  ])
}

// find reviews where the stores _id property === reviews store property
storeSchema.virtual('reviews', {
  ref: 'Review', //what model to link
  localField: '_id', //which field on the review
  foreignField: 'store'  //which field on the store
});

function autopopulate(next) {
  this.populate('reviews');
  next();
}

storeSchema.pre('find', autopopulate);
storeSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Store', storeSchema);

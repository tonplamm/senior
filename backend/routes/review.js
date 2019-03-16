let express = require('express');
let router = express.Router();
let mongo = require('mongodb')

/* GET users listing. */
router.get('/', (req, res, next) => {
  const DB_REVIEW = req.app.locals.DB_REVIEW
  DB_REVIEW.find({}, {projection: {companyName: 1, jobDescriptionTitle: 1, payment: 1, transportationTitle: 1, star: 1, logo: 1}}).toArray()
  .then(response => res.send(response))
  .catch(error => res.send(error))
});

router.get('/search', (req, res, next) => {
  /* when adding new company's name */
  const DB_REVIEW = req.app.locals.DB_REVIEW
  DB_REVIEW.find({}, {projection: {companyName: 1}}).toArray()
  .then(response => res.send(response))
  .catch(error => res.send(error))
});

router.get('/:_id', (req, res, next) => {
  const DB_REVIEW = req.app.locals.DB_REVIEW
  DB_REVIEW.find({_id: mongo.ObjectID(req.params._id)}).toArray()
  .then(response => res.send(response))
  .catch(error => res.send(error))
});

router.post('/add', (req, res, next) => {
  const DB_REVIEW = req.app.locals.DB_REVIEW
  DB_REVIEW.insertOne(req.body)
  .then(() => res.send({"add": true}))
  .catch(() => res.send({"add": false}))
});

router.post('/update', (req, res, next) => {
  const DB_REVIEW = req.app.locals.DB_REVIEW
  req.body._id = mongo.ObjectID(req.body._id)
  DB_REVIEW.updateOne({_id: req.body._id}, {$set: req.body})
  .then(() => res.send({"update": true}))
  .catch(() => res.send({"update": false}))
});

router.post('/delete', (req, res, next) => {
  const DB_REVIEW = req.app.locals.DB_REVIEW
  req.body._id = mongo.ObjectID(req.body._id)
  DB_REVIEW.remove({_id: req.body._id})
  .then(() => res.send({"delete": true}))
  .catch(() => res.send({"delete": false}))
});

module.exports = router;

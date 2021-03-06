let express = require('express')
let router = express.Router()
let mongo = require('mongodb')
let withAuth = require('./middleware')

/* GET users listing. */
router.get('/', (req, res, next) => {
  const DB_REVIEW = req.app.locals.DB_REVIEW
  DB_REVIEW.find({}, {projection: {companyName: 1, jobDescriptionTitle: 1, payment: 1, transportationTitle: 1, star: 1, logo: 1}}).toArray()
  .then(response => res.send({code: 1, data: response}))
  .catch(() => res.send({code: 0, data: ""}))
});

router.get('/all_company_name', (req, res, next) => {
  const DB_REVIEW = req.app.locals.DB_REVIEW
  DB_REVIEW.find({}, {projection: {companyName: 1}}).toArray()
  .then(response => res.send({code: 1, data: response}))
  .catch(() => res.send({code: 0, data: ""}))
});

router.post('/search', (req, res, next) => {
  const DB_REVIEW = req.app.locals.DB_REVIEW
  DB_REVIEW.find({companyName: {$regex: req.body.text, $options: "$i"}}, {projection: {companyName: 1}}).toArray()
  .then(response => res.send({code: 1, data: response}))
  .catch(() => res.send({code: 0, data: ""}))
});

router.get('/:id', (req, res, next) => {
  const DB_REVIEW = req.app.locals.DB_REVIEW
  DB_REVIEW.find({_id: mongo.ObjectID(req.params.id)}).toArray()
  .then(response => res.send({code: 1, data: response[0]}))
  .catch(() => res.send({code: 0, data: ""}))
});

router.post('/add', (req, res, next) => {
  const DB_REVIEW = req.app.locals.DB_REVIEW
  DB_REVIEW.insertOne(req.body)
  .then(() => res.send({code: 1}))
  .catch(() => res.send({code: 0}))
});

router.post('/update', (req, res, next) => {
  let star = 0
  let comments = req.body.comments
  let commentLength = comments.length
  comments.map(tmp => {
    star += tmp.star
  })
  req.body.star = star/commentLength
  const DB_REVIEW = req.app.locals.DB_REVIEW
  DB_REVIEW.updateOne({companyName: req.body.companyName}, {$set: req.body})
  .then(() => res.send({code: 1}))
  .catch(() => res.send({code: 0}))
});

router.post('/delete', (req, res, next) => {
  const DB_REVIEW = req.app.locals.DB_REVIEW
  req.body._id = mongo.ObjectID(req.body._id)
  DB_REVIEW.remove({_id: req.body._id})
  .then(() => res.send({code: 1}))
  .catch(() => res.send({code: 0}))
});

module.exports = router;

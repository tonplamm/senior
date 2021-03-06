var express = require('express')
var router = express.Router()
let mongo = require('mongodb')
let withAuth = require('./middleware')

/* GET home page. */
router.get('/', (req, res, next) => {
  const DB_SCHEDULE = req.app.locals.DB_SCHEDULE
  DB_SCHEDULE.find({}).sort({deadline: 1}).toArray()
  .then(response => res.send({code: 1, data: response}))
  .catch(() => res.send({code: 0, data: ""}))
})

router.post('/add', (req, res, next) => {
  const DB_SCHEDULE = req.app.locals.DB_SCHEDULE
  DB_SCHEDULE.insertOne(req.body)
  .then(() => res.send({code: 1, data: ""}))
  .catch(() => res.send({code: 0, data: ""}))
})

router.post('/update', (req, res, next) => {
  const DB_SCHEDULE = req.app.locals.DB_SCHEDULE
  req.body._id = mongo.ObjectID(req.body._id)
  DB_SCHEDULE.updateOne({_id: req.body._id}, {$set: req.body})
  .then(() => res.send({code: 1, data: ""}))
  .catch(() => res.send({code: 0, data: ""}))
})

router.post('/delete', (req, res, next) => {
  const DB_SCHEDULE = req.app.locals.DB_SCHEDULE
  req.body._id = mongo.ObjectID(req.body._id)
  DB_SCHEDULE.remove({_id: req.body._id})
  .then(() => res.send({code:1, data: ""}))
  .catch(() => res.send({code: 0, data: ""}))
})

module.exports = router;

var express = require('express');
var router = express.Router();
let mongo = require('mongodb')

/* GET home page. */
router.get('/', (req, res, next) => {
  const DB_SCHEDULE = req.app.locals.DB_SCHEDULE
  DB_SCHEDULE.find({}).toArray()
  .then(response => res.send(response))
  .catch(error => res.send(error))
});

router.post('/update', (req, res, next) => {
  const DB_SCHEDULE = req.app.locals.DB_SCHEDULE
  req.body._id = mongo.ObjectID(req.body._id)
  DB_SCHEDULE.updateOne({_id: req.body._id}, {$set: req.body})
  .then(() => res.send({"update": true}))
  .catch(() => res.send({"update": false}))
});

router.post('/delete', (req, res, next) => {
  const DB_SCHEDULE = req.app.locals.DB_SCHEDULE
  req.body._id = mongo.ObjectID(req.body._id)
  DB_SCHEDULE.remove({_id: req.body._id})
  .then(() => res.send({"delete": true}))
  .catch(() => res.send({"delete": false}))
});

module.exports = router;

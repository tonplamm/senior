let express = require('express');
let router = express.Router();

// let mongo = require('mongodb')

/* GET users listing. */
router.get('/', (req, res, next) => {
  const DB_REGISTER = req.app.locals.DB_REGISTER
  DB_REGISTER.find({}).toArray()
  .then(response => res.send(response))
  .catch(error => res.send(error))
});

router.post('/login', (req, res, next) => {
  const DB_REGISTER = req.app.locals.DB_REGISTER
  DB_REGISTER.find(req.body, {projection: {username: 1, firstname: 1, lastname: 1}}).toArray()
  .then(response => {
    if(response != []){
      let data = {username: response[0].username, firstname: response[0].firstname, lastname: response[0].lastname}
      res.send({code: 1, data: data})
    }else{
      res.send({code: 0, data: ""})
    }
  })
  .catch(() => res.send({code: 0, response: ""}))
})

router.post('/add', (req, res, next) => {
  const DB_REGISTER = req.app.locals.DB_REGISTER
  DB_REGISTER.insertOne(req.body)
  .then(() => res.send({"add": true}))
  .catch(() => res.send({"add": false}))
})

router.post('/forget', (req, res, next) => {
  const DB_REGISTER = req.app.locals.DB_REGISTER
  let username = req.body.username
  DB_REGISTER.find({username: username}).toArray()
  .then(response => res.send({"forget": true, "password": response[0].password}))
  .catch(() => res.send({"forget": false}))
})

module.exports = router;

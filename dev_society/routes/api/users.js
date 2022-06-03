const express = require('express'); 

const router = express.Router();
const gravatar = require('gravatar'); 
const bcrypt = require('bcryptjs'); 

//Load User Model
const User = require('../../models/User'); 

router.get('/test', (req, res) => res.json({msg : "Users Works"})); 

router.post('/register', (req, res) => {
  const {name, email, password} = req.body; 
  User.findOne({email})
    .then(user => {
      if(user) {
        return res.status(400).json({email: 'Email already exists'});
      } else {
        const avatar = gravatar.url(email, {
          s: '200', // Size
          r: 'pg', //Rating
          d: 'mm' //Default
        }); 

        const newUser = new User({
          name,
          email,
          avatar,
          password
        }); 

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if(err) throw err; 
              newUser.password = hash; 
              newUser
                .save()
                .then(user => res.json(user))
                .catch(err => console.log(err)); 
            }); 
        });
      }
    })
})

module.exports = router; 
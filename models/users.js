const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      bcrypt = require('bcryptjs');

const UserSchema = new Schema({
  f_name: String,
  l_name: String,
  email:{
    type: String,
    unique: true,
    lowercase: true
  },
  org: String,
  password: String,
  expiry: Date,
  role: {
    type: String,
    default: 'user'
  },
  active: {
    type: Boolean,
    default: false
  }
}, {timestamps: true});

UserSchema.methods.hashPass = function(password){
  return bcrypt.hashSync(password, 10);
};

UserSchema.methods.comparePass = function(password){
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
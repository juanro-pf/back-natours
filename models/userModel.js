const { Schema, model }= require('mongoose');
const validator= require('validator');
const bcrypt= require('bcryptjs');

const  userSchema= new Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm the password'],
    validate: {
      // This only works with CREATE and SAVE!
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords must be equal'
    }
  }
});

userSchema.pre('save', async function(next) {
  if(!this.isModified('password')) return next();

  this.password= await bcrypt.hash(this.password, 12);

  this.passwordConfirm= undefined;
  next();
});

userSchema.methods.correctPassword= async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User= model('User', userSchema);

module.exports= User;
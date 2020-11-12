const crypto= require('crypto');
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
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
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
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.pre('save', async function(next) {
  if(!this.isModified('password')) return next();

  this.password= await bcrypt.hash(this.password, 12);

  this.passwordConfirm= undefined;
  next();
});

userSchema.pre('save', async function(next) {
  if(!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt= Date.now() - 1000; // Se le resta un segundo porque a veces el token tarda más en crearse que la base de datos en guardar este campo
  next();
});

userSchema.pre(/^find/, function(next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword= async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter= function(JWTTimestamp) {
  if(this.passwordChangedAt) {
    const changedTimeStamp= parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimeStamp;
  }

  // False means not changed
  return false;
};

userSchema.methods.createPasswordResetToken= function() {
  const resetToken= crypto.randomBytes(32).toString('hex');

  this.passwordResetToken= crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires= Date.now() + 10 * 60 * 1000; //now + 10 minutes
  // console.log({resetToken}, this.passwordResetToken);
  return resetToken;
};

const User= model('User', userSchema);

module.exports= User;
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    id: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    photo: String,
    isExpired: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    location: String,

    stripeID: String,
    pushToken: String,

    level: {
      type: String,
      default: 'free',
    },
    Date: {
      type: Date,
      default: Date.now,
    },
    ExpireDate: {
      type: Date,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    lastLogins: [
      {
        userLocation: {
          latitude: {
            type: Number,
          },
          longitude: {
            type: Number,
          },
        },
        deviceType: {
          type: String,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    acceptTerms: {
      type: Boolean,
      default: false,
    },
  },

  { collection: 'users' }
);

const model = mongoose.model('UserSchema', UserSchema);

module.exports = model;

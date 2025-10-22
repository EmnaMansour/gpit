"use strict";
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phone: String,
    status: {
        type: String,
        enum: ['en_attente', 'confirmé', 'rejeté'],
        default: 'en_attente'
    },
    confirmationToken: String,
    confirmationTokenExpiry: Date,
    confirmationDate: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});
// Hash password avant de sauvegarder
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});
module.exports = mongoose.model('Admin', adminSchema);

"use strict";
const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
    conversationId: {
        type: String,
        required: false,
        index: true
    },
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    meta: {
        type: Object,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});
// Index pour les requêtes fréquentes
MessageSchema.index({ conversationId: 1, createdAt: -1 });
module.exports = mongoose.model('Message', MessageSchema);

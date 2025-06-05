import mongoose from 'mongoose';

const eventRegistrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  attendee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true, versionKey: false });

// Ensure a user can register only once per event
eventRegistrationSchema.index({ event: 1, attendee: 1 }, { unique: true });

const Registration = mongoose.model('Registration', eventRegistrationSchema);
export default Registration;


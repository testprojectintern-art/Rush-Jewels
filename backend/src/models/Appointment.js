import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
    {
        customerName: {
            type: String,
            required: [true, 'Customer name is required'],
            trim: true,
        },
        customerPhone: {
            type: String,
            required: [true, 'Customer phone number is required'],
            trim: true,
        },
        customerEmail: {
            type: String,
            trim: true,
            lowercase: true,
        },
        showroom: {
            type: String,
            required: [true, 'Showroom location is required'],
            trim: true,
        },
        date: {
            type: Date,
            required: [true, 'Appointment date is required'],
        },
        timeSlot: {
            type: String,
            required: [true, 'Time slot is required'],
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;

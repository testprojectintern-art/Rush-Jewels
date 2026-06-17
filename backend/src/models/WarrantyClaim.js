import mongoose from 'mongoose';
import { getNextSequence } from './Counter.js';

const warrantyClaimSchema = new mongoose.Schema({
    claimNumber: { 
        type: String, 
        unique: true, 
        uppercase: true, 
        trim: true 
    },
    serialNumber: { 
        type: String, 
        required: true, 
        uppercase: true, 
        trim: true 
    },
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    customerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Customer', 
        required: true 
    },
    issueDescription: { 
        type: String, 
        required: true,
        trim: true
    },
    supplierId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Supplier' 
    },
    status: {
        type: String,
        enum: ['received_from_customer', 'sent_to_supplier', 'returned_from_supplier', 'delivered_to_customer', 'rejected'],
        default: 'received_from_customer'
    },
    notes: {
        type: String,
        trim: true
    },
    resolvedAt: {
        type: Date
    }
}, { timestamps: true });

warrantyClaimSchema.pre('save', async function() {
    if (this.isNew && !this.claimNumber) {
        const seq = await getNextSequence('warranty_claim');
        this.claimNumber = `CLM-${seq}`;
    }
    if (this.status === 'delivered_to_customer' || this.status === 'rejected') {
        this.resolvedAt = new Date();
    }
});

warrantyClaimSchema.index({ claimNumber: 1 });
warrantyClaimSchema.index({ serialNumber: 1 });
warrantyClaimSchema.index({ customerId: 1 });
warrantyClaimSchema.index({ status: 1 });

const WarrantyClaim = mongoose.model('WarrantyClaim', warrantyClaimSchema);
export default WarrantyClaim;

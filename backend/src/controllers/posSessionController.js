import asyncHandler from 'express-async-handler';
import PosSession from '../models/PosSession.js';

export const getActiveSession = asyncHandler(async (req, res) => {
    const session = await PosSession.findOne({ userId: req.user._id, status: 'open' });
    res.json({ success: true, data: session });
});

export const openSession = asyncHandler(async (req, res) => {
    const existing = await PosSession.findOne({ userId: req.user._id, status: 'open' });
    if (existing) {
        res.status(400); throw new Error('You already have an open session');
    }

    const session = new PosSession({
        userId: req.user._id,
        openingBalance: req.body.openingBalance || 0,
        notes: req.body.notes,
    });

    await session.save();
    res.status(201).json({ success: true, data: session });
});

export const closeSession = asyncHandler(async (req, res) => {
    const session = await PosSession.findOne({ userId: req.user._id, status: 'open' });
    if (!session) {
        res.status(404); throw new Error('No open session found');
    }

    session.status = 'closed';
    session.actualClosingBalance = req.body.actualClosingBalance || 0;
    session.notes = req.body.notes ? `${session.notes || ''}\nClosing Note: ${req.body.notes}` : session.notes;
    
    await session.save();
    res.json({ success: true, data: session });
});

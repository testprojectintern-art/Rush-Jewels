import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// Protect routes — verify JWT
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check Authorization header
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token provided');
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database (excludes password)
        const user = await User.findById(decoded.id);

        if (!user) {
            res.status(401);
            throw new Error('User not found');
        }

        if (!user.isActive) {
            res.status(403);
            throw new Error('Account is deactivated');
        }

        req.user = user;

        // Portal Context Validation
        const portalHeader = req.headers['x-portal-context'] || 'main';
        if (portalHeader !== 'public' && portalHeader !== 'owner_dashboard') {
            if (user.role !== 'admin' && user.role !== 'owner' && user.allowedPortals && !user.allowedPortals.includes(portalHeader)) {
                res.status(403);
                throw new Error(`User does not have access to portal: ${portalHeader}`);
            }
        }
        if (portalHeader === 'owner_dashboard' && !['admin', 'owner'].includes(user.role)) {
            res.status(403);
            throw new Error('Only owners and admins can access the owner dashboard.');
        }
        req.portal = portalHeader;

        next();
    } catch (error) {
        res.status(401);
        throw new Error('Not authorized, token invalid or expired');
    }
});

// Restrict by role
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401);
            throw new Error('Not authorized');
        }
        if (!roles.includes(req.user.role)) {
            res.status(403);
            throw new Error(`Role '${req.user.role}' is not authorized for this action`);
        }
        next();
    };
};
import mongoose from 'mongoose';

export const getPortalFilter = (portalHeader) => {
    if (!portalHeader || portalHeader === 'owner_dashboard') {
        return {};
    }
    if (portalHeader === 'main') {
        return {
            $or: [
                { portal: 'main' },
                { portal: { $exists: false } },
                { portal: null }
            ]
        };
    }
    return { portal: portalHeader };
};

export const getPortalWarehouseIds = async (portalHeader) => {
    if (!portalHeader || portalHeader === 'owner_dashboard' || portalHeader === 'online_orders') {
        return null;
    }
    const Warehouse = mongoose.model('Warehouse');
    const query = {};
    if (portalHeader === 'main') {
        query.type = 'main';
    }
    const whs = await Warehouse.find(query).select('_id').lean();
    return whs.map(w => w._id.toString());
};

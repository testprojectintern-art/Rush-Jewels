// High-End Luxury Jewelry Demo Dataset for Rush Jewels
// Used for high-impact client demonstrations, portfolio showcase, and fallback when DB is cleared

export const DEMO_PRODUCTS = [
    {
        _id: 'demo-prod-01',
        productCode: 'RJ-RNG-01',
        name: 'The Empress Oval Solitaire Diamond Ring (1.80 ct)',
        category: 'rings',
        brand: 'Rush Haute Joaillerie',
        basePrice: 620000,
        discountPercent: 12,
        discountPrice: 545600,
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85',
        images: [
            'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=900&q=85'
        ],
        description: 'An iconic oval-cut diamond set upon an 18-karat micro-pavé band. Certified by GIA with exceptional fire, symmetry, and uncompromised brilliance.',
        metal: '18K White Gold',
        purity: '750 Hallmark',
        gemstone: 'Natural Diamond (VVS1, F Color)',
        caratWeight: '1.80 Carats',
        grossWeight: '4.85 g',
        rating: 5.0,
        reviewsCount: 34,
        isFeatured: true,
        isBestseller: true,
        stocks: [
            { warehouseId: 'wh-colombo', warehouseName: 'Colombo Flagship Salon', available: 4 },
            { warehouseId: 'wh-kandy', warehouseName: 'Kandy Heritage Arcade', available: 2 }
        ],
        variations: [
            { _id: 'v1', name: 'Ring Size 6 (US)', priceAdjustment: 0 },
            { _id: 'v2', name: 'Ring Size 7 (US)', priceAdjustment: 0 },
            { _id: 'v3', name: 'Ring Size 8 (US)', priceAdjustment: 12000 }
        ]
    },
    {
        _id: 'demo-prod-02',
        productCode: 'RJ-NCK-02',
        name: 'Ceylon Royal Blue Sapphire & Diamond Choker',
        category: 'necklaces',
        brand: 'Rush Heritage',
        basePrice: 1250000,
        discountPercent: 10,
        discountPrice: 1125000,
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85',
        images: [
            'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85'
        ],
        description: 'A tribute to Sri Lanka’s legendary sapphire legacy. Hand-selected unheated cornflower blue sapphires framed by luminous brilliant-cut diamonds.',
        metal: '18K Yellow Gold',
        purity: '750 Hallmark',
        gemstone: 'Natural Ceylon Sapphire & Diamonds',
        caratWeight: '5.20 ct Sapphires / 1.40 ct Diamonds',
        grossWeight: '18.40 g',
        rating: 4.9,
        reviewsCount: 19,
        isFeatured: true,
        isBestseller: true,
        stocks: [
            { warehouseId: 'wh-colombo', warehouseName: 'Colombo Flagship Salon', available: 2 },
            { warehouseId: 'wh-galle', warehouseName: 'Galle Fort Boutique', available: 1 }
        ],
        variations: [
            { _id: 'v1', name: 'Standard 16" Length', priceAdjustment: 0 },
            { _id: 'v2', name: 'Princess 18" Length', priceAdjustment: 35000 }
        ]
    },
    {
        _id: 'demo-prod-03',
        productCode: 'RJ-BRC-03',
        name: 'Lumière Tennis Diamond Bracelet (3.50 ct TW)',
        category: 'bracelets',
        brand: 'Rush Signature',
        basePrice: 890000,
        discountPercent: 15,
        discountPrice: 756500,
        image: 'https://images.unsplash.com/photo-1611591475878-a8d6722d36eb?auto=format&fit=crop&w=900&q=85',
        images: [
            'https://images.unsplash.com/photo-1611591475878-a8d6722d36eb?auto=format&fit=crop&w=900&q=85'
        ],
        description: 'A seamless cascade of 52 meticulously matched brilliant-cut diamonds held securely in four-prong platinum baskets with safety double-lock clasp.',
        metal: 'Platinum 950',
        purity: 'Pt950 Certified',
        gemstone: 'Round Brilliant Diamonds (VS, E/F)',
        caratWeight: '3.50 Carats Total Weight',
        grossWeight: '12.60 g',
        rating: 4.95,
        reviewsCount: 42,
        isFeatured: true,
        isBestseller: true,
        stocks: [
            { warehouseId: 'wh-colombo', warehouseName: 'Colombo Flagship Salon', available: 5 },
            { warehouseId: 'wh-kandy', warehouseName: 'Kandy Heritage Arcade', available: 3 }
        ],
        variations: [
            { _id: 'v1', name: 'Length 6.5 inches', priceAdjustment: 0 },
            { _id: 'v2', name: 'Length 7.0 inches', priceAdjustment: 18000 }
        ]
    },
    {
        _id: 'demo-prod-04',
        productCode: 'RJ-EAR-04',
        name: 'Cascade Emerald-Cut Chandelier Drops',
        category: 'earrings',
        brand: 'Rush Haute Joaillerie',
        basePrice: 510000,
        discountPercent: 18,
        discountPrice: 418200,
        image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=85',
        images: [
            'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=85'
        ],
        description: 'Fluid movement meets architectural precision. Stepped emerald-cut solitaire stones framed by hand-carved millgrain borders.',
        metal: '18K Rose Gold',
        purity: '750 Hallmark',
        gemstone: 'Emerald-Cut Diamonds (VVS2)',
        caratWeight: '2.10 Carats Total',
        grossWeight: '6.20 g',
        rating: 4.88,
        reviewsCount: 27,
        isFeatured: true,
        isBestseller: false,
        stocks: [
            { warehouseId: 'wh-colombo', warehouseName: 'Colombo Flagship Salon', available: 3 }
        ],
        variations: [
            { _id: 'v1', name: 'Post Back (Pierced)', priceAdjustment: 0 },
            { _id: 'v2', name: 'Screw Back (Secure)', priceAdjustment: 5000 }
        ]
    },
    {
        _id: 'demo-prod-05',
        productCode: 'RJ-RNG-05',
        name: 'The Sovereign 22K Solid Gold Heritage Band',
        category: 'rings',
        brand: 'Rush Atelier',
        basePrice: 340000,
        discountPercent: 8,
        discountPrice: 312800,
        image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=900&q=85',
        images: [
            'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=900&q=85'
        ],
        description: 'Pure traditional elegance. Heavyweight 22-karat satin-brushed gold with hand-engraved interior monogramming service available.',
        metal: '22K Solid Gold',
        purity: '916 Hallmark Assay Verified',
        gemstone: 'None (Pure Gold)',
        caratWeight: 'N/A',
        grossWeight: '11.50 g',
        rating: 4.96,
        reviewsCount: 51,
        isFeatured: false,
        isBestseller: true,
        stocks: [
            { warehouseId: 'wh-colombo', warehouseName: 'Colombo Flagship Salon', available: 8 },
            { warehouseId: 'wh-kandy', warehouseName: 'Kandy Heritage Arcade', available: 6 }
        ],
        variations: [
            { _id: 'v1', name: 'Width 4mm', priceAdjustment: 0 },
            { _id: 'v2', name: 'Width 6mm', priceAdjustment: 28000 }
        ]
    },
    {
        _id: 'demo-prod-06',
        productCode: 'RJ-NCK-06',
        name: 'South Sea Keshi Pearl & Diamond Strand',
        category: 'necklaces',
        brand: 'Rush Oceans',
        basePrice: 780000,
        discountPercent: 20,
        discountPrice: 624000,
        image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=900&q=85',
        images: [
            'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=900&q=85'
        ],
        description: 'Rare Australian South Sea cultured pearls displaying deep silver-white orient luster, closed with an 18K diamond pavé barrel clasp.',
        metal: '18K White Gold',
        purity: '750 Hallmark',
        gemstone: 'South Sea Pearls (11-13mm) & Diamonds',
        caratWeight: '0.45 ct Diamonds',
        grossWeight: '38.20 g',
        rating: 4.92,
        reviewsCount: 15,
        isFeatured: true,
        isBestseller: false,
        stocks: [
            { warehouseId: 'wh-colombo', warehouseName: 'Colombo Flagship Salon', available: 2 }
        ],
        variations: [
            { _id: 'v1', name: 'Matinee 20" Strand', priceAdjustment: 0 }
        ]
    },
    {
        _id: 'demo-prod-07',
        productCode: 'RJ-PND-07',
        name: 'Padparadscha Sunset Sapphire Solitaire Pendant',
        category: 'pendants',
        brand: 'Rush Rare Gems',
        basePrice: 940000,
        discountPercent: 10,
        discountPrice: 846000,
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85',
        images: [
            'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85'
        ],
        description: 'The lotus bloom of gemology. An authentic unheated Ceylon Padparadscha sapphire glowing with salmon-pink fire, suspended from a delicate Singapore chain.',
        metal: '18K Rose Gold',
        purity: '750 Hallmark',
        gemstone: 'Natural Ceylon Padparadscha Sapphire',
        caratWeight: '2.40 Carats',
        grossWeight: '5.10 g',
        rating: 5.0,
        reviewsCount: 11,
        isFeatured: true,
        isBestseller: true,
        stocks: [
            { warehouseId: 'wh-colombo', warehouseName: 'Colombo Flagship Salon', available: 1 },
            { warehouseId: 'wh-kandy', warehouseName: 'Kandy Heritage Arcade', available: 1 }
        ],
        variations: [
            { _id: 'v1', name: 'Includes 18" Gold Chain', priceAdjustment: 0 }
        ]
    },
    {
        _id: 'demo-prod-08',
        productCode: 'RJ-BRC-08',
        name: 'The Royal Filigree Peacock Cuff (22K Gold)',
        category: 'bracelets',
        brand: 'Rush Heritage',
        basePrice: 690000,
        discountPercent: 12,
        discountPrice: 607200,
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85',
        images: [
            'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85'
        ],
        description: 'Exacting hand-drawn wire filigree executed by master Kandyan goldsmiths. Hinged cuff silhouette with antique satin patina and ruby eyes.',
        metal: '22K Gold & Rubies',
        purity: '916 Hallmark Assayed',
        gemstone: 'Burmese Rubies (Cabochon)',
        caratWeight: '0.80 ct Rubies',
        grossWeight: '24.10 g',
        rating: 4.97,
        reviewsCount: 38,
        isFeatured: true,
        isBestseller: true,
        stocks: [
            { warehouseId: 'wh-kandy', warehouseName: 'Kandy Heritage Arcade', available: 2 },
            { warehouseId: 'wh-galle', warehouseName: 'Galle Fort Boutique', available: 2 }
        ],
        variations: [
            { _id: 'v1', name: 'Medium Wrist (2.4" inner dia)', priceAdjustment: 0 },
            { _id: 'v2', name: 'Large Wrist (2.6" inner dia)', priceAdjustment: 22000 }
        ]
    }
];

export const DEMO_WAREHOUSES = [
    { id: 'wh-colombo', name: 'Colombo Flagship Salon (Ward Place)' },
    { id: 'wh-kandy', name: 'Kandy Heritage Arcade' },
    { id: 'wh-galle', name: 'Galle Fort Luxury Boutique' }
];

export const DEMO_CERTIFICATES = {
    'GIA-12345678': {
        found: true,
        data: {
            certificateNumber: 'GIA-12345678',
            authenticity: 'Authentic Natural Diamond (GIA Lab Certified)',
            shape: 'Round Brilliant',
            caratWeight: '1.52 Carats',
            colorGrade: 'D (Colorless)',
            clarityGrade: 'VVS1 (Very Very Slightly Included)',
            cutGrade: 'Excellent',
            polish: 'Excellent',
            symmetry: 'Excellent',
            fluorescence: 'None',
            issueDate: 'October 12, 2025'
        }
    },
    'GIA-22019482': {
        found: true,
        data: {
            certificateNumber: 'GIA-22019482',
            authenticity: 'Authentic Royal Blue Sapphire (GIA/NGJA Certified)',
            shape: 'Cushion Mixed Cut',
            caratWeight: '3.18 Carats',
            colorGrade: 'Vivid Royal Blue (Unheated)',
            clarityGrade: 'Eye Clean (Flawless Origin)',
            cutGrade: 'Ideal Precision Facet',
            polish: 'Very Good',
            symmetry: 'Excellent',
            fluorescence: 'Inert',
            issueDate: 'January 18, 2026'
        }
    }
};

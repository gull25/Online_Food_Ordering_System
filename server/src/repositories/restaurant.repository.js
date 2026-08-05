const Restaurant = require('../models/restaurant.model');

class RestaurantRepository {
    async findAll(query = {}, options = { includeUnapproved: false }) {
        let lat, lng;
        if (query.lat && query.lng) {
            lat = parseFloat(query.lat);
            lng = parseFloat(query.lng);
            delete query.lat;
            delete query.lng;
        }

        // Clean up other potential non-schema query params here if needed
        delete query.featured; // from controller if passed through

        if (!options.includeUnapproved) {
            query.status = 'Open';
        }

        if (lat && lng) {
            return await Restaurant.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [lng, lat] },
                        distanceField: "distanceInMeters",
                        spherical: true,
                        query: query
                    }
                },
                {
                    $match: {
                        $expr: {
                            $lte: ["$distanceInMeters", { $multiply: ["$deliveryRadius", 1000] }]
                        }
                    }
                }
            ]);
        }

        return await Restaurant.find(query).lean();
    }

    async findById(id, options = { includeUnapproved: false }) {
        const query = { _id: id };
        if (!options.includeUnapproved) {
            query.status = 'Open';
        }
        return await Restaurant.findOne(query).lean();
    }

    async create(restaurantData) {
        return await Restaurant.create(restaurantData);
    }

    async update(id, restaurantData) {
        return await Restaurant.findByIdAndUpdate(id, restaurantData, {
            new: true,
            runValidators: true
        });
    }

    async delete(id) {
        return await Restaurant.findByIdAndDelete(id);
    }
}

module.exports = new RestaurantRepository();


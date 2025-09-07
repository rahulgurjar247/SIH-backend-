import mongoose from 'mongoose';
import Location from '../models/Location.js';
import dotenv from 'dotenv';

dotenv.config();

// Sample Indian states and districts data
const sampleLocations = [
  // Rajasthan State
  {
    name: 'Rajasthan',
    type: 'state',
    parentId: null,
    bounds: {
      north: 30.0,
      south: 23.0,
      east: 78.0,
      west: 69.0
    },
    center: {
      latitude: 26.2389,
      longitude: 73.0243
    },
    zoomLevel: 7,
    level: 1,
    stateCode: 'RJ'
  },
  // Rajasthan Districts
  {
    name: 'Udaipur',
    type: 'district',
    parentId: null, // Will be updated after Rajasthan is created
    bounds: {
      north: 25.0,
      south: 24.0,
      east: 75.0,
      west: 73.0
    },
    center: {
      latitude: 24.5927,
      longitude: 73.7227
    },
    zoomLevel: 10,
    level: 2,
    districtCode: 'UD'
  },
  {
    name: 'Jaipur',
    type: 'district',
    parentId: null,
    bounds: {
      north: 27.5,
      south: 26.5,
      east: 76.5,
      west: 75.0
    },
    center: {
      latitude: 26.9124,
      longitude: 75.7873
    },
    zoomLevel: 10,
    level: 2,
    districtCode: 'JP'
  },
  {
    name: 'Jodhpur',
    type: 'district',
    parentId: null,
    bounds: {
      north: 27.0,
      south: 26.0,
      east: 73.5,
      west: 72.5
    },
    center: {
      latitude: 26.2389,
      longitude: 73.0243
    },
    zoomLevel: 10,
    level: 2,
    districtCode: 'JD'
  },
  // Delhi State
  {
    name: 'Delhi',
    type: 'state',
    parentId: null,
    bounds: {
      north: 28.9,
      south: 28.4,
      east: 77.4,
      west: 76.8
    },
    center: {
      latitude: 28.6139,
      longitude: 77.2090
    },
    zoomLevel: 11,
    level: 1,
    stateCode: 'DL'
  },
  // Delhi Districts
  {
    name: 'Central Delhi',
    type: 'district',
    parentId: null,
    bounds: {
      north: 28.7,
      south: 28.5,
      east: 77.3,
      west: 77.1
    },
    center: {
      latitude: 28.6139,
      longitude: 77.2090
    },
    zoomLevel: 12,
    level: 2,
    districtCode: 'CD'
  },
  {
    name: 'New Delhi',
    type: 'district',
    parentId: null,
    bounds: {
      north: 28.7,
      south: 28.5,
      east: 77.3,
      west: 77.1
    },
    center: {
      latitude: 28.6139,
      longitude: 77.2090
    },
    zoomLevel: 12,
    level: 2,
    districtCode: 'ND'
  },
  // Maharashtra State
  {
    name: 'Maharashtra',
    type: 'state',
    parentId: null,
    bounds: {
      north: 22.0,
      south: 15.0,
      east: 80.0,
      west: 72.0
    },
    center: {
      latitude: 19.7515,
      longitude: 75.7139
    },
    zoomLevel: 7,
    level: 1,
    stateCode: 'MH'
  },
  // Maharashtra Districts
  {
    name: 'Mumbai',
    type: 'district',
    parentId: null,
    bounds: {
      north: 19.3,
      south: 19.0,
      east: 73.0,
      west: 72.7
    },
    center: {
      latitude: 19.0760,
      longitude: 72.8777
    },
    zoomLevel: 12,
    level: 2,
    districtCode: 'MB'
  },
  {
    name: 'Pune',
    type: 'district',
    parentId: null,
    bounds: {
      north: 19.0,
      south: 18.0,
      east: 74.5,
      west: 73.5
    },
    center: {
      latitude: 18.5204,
      longitude: 73.8567
    },
    zoomLevel: 10,
    level: 2,
    districtCode: 'PN'
  },
  // Udaipur Tehsils
  {
    name: 'Udaipur Tehsil',
    type: 'tehsil',
    parentId: null,
    bounds: {
      north: 24.8,
      south: 24.4,
      east: 74.0,
      west: 73.6
    },
    center: {
      latitude: 24.5927,
      longitude: 73.7227
    },
    zoomLevel: 13,
    level: 3
  },
  {
    name: 'Girwa Tehsil',
    type: 'tehsil',
    parentId: null,
    bounds: {
      north: 24.7,
      south: 24.3,
      east: 73.8,
      west: 73.4
    },
    center: {
      latitude: 24.5,
      longitude: 73.6
    },
    zoomLevel: 13,
    level: 3
  }
];

const seedLocations = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing locations
    await Location.deleteMany({});
    console.log('Cleared existing locations');

    // Create locations
    const createdLocations = [];
    
    for (const locationData of sampleLocations) {
      const location = new Location(locationData);
      await location.save();
      createdLocations.push(location);
      console.log(`Created ${location.type}: ${location.name}`);
    }

    // Update parent-child relationships
    const rajasthan = createdLocations.find(l => l.name === 'Rajasthan');
    const delhi = createdLocations.find(l => l.name === 'Delhi');
    const maharashtra = createdLocations.find(l => l.name === 'Maharashtra');
    const udaipur = createdLocations.find(l => l.name === 'Udaipur');

    // Update Rajasthan districts
    const rajasthanDistricts = createdLocations.filter(l => 
      ['Udaipur', 'Jaipur', 'Jodhpur'].includes(l.name) && l.type === 'district'
    );
    for (const district of rajasthanDistricts) {
      district.parentId = rajasthan._id;
      await district.save();
      console.log(`Updated ${district.name} parent to Rajasthan`);
    }

    // Update Delhi districts
    const delhiDistricts = createdLocations.filter(l => 
      ['Central Delhi', 'New Delhi'].includes(l.name) && l.type === 'district'
    );
    for (const district of delhiDistricts) {
      district.parentId = delhi._id;
      await district.save();
      console.log(`Updated ${district.name} parent to Delhi`);
    }

    // Update Maharashtra districts
    const maharashtraDistricts = createdLocations.filter(l => 
      ['Mumbai', 'Pune'].includes(l.name) && l.type === 'district'
    );
    for (const district of maharashtraDistricts) {
      district.parentId = maharashtra._id;
      await district.save();
      console.log(`Updated ${district.name} parent to Maharashtra`);
    }

    // Update Udaipur tehsils
    const udaipurTehsils = createdLocations.filter(l => 
      ['Udaipur Tehsil', 'Girwa Tehsil'].includes(l.name) && l.type === 'tehsil'
    );
    for (const tehsil of udaipurTehsils) {
      tehsil.parentId = udaipur._id;
      await tehsil.save();
      console.log(`Updated ${tehsil.name} parent to Udaipur`);
    }

    console.log('✅ Location seeding completed successfully!');
    console.log(`Created ${createdLocations.length} locations`);

  } catch (error) {
    console.error('❌ Error seeding locations:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seeder
seedLocations();

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, Clock, Star, Filter, Search } from 'lucide-react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const NearbyRehabCenters = () => {
  const [centers, setCenters] = useState([]);
  const [filteredCenters, setFilteredCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [filterType, setFilterType] = useState('all'); // all, rehab, physio
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState({ lat: 12.9343, lng: 77.6043 }); // Default: PES University, Banshankari, Bengaluru
  const [selectedMarker, setSelectedMarker] = useState(null); // For InfoWindow on map
  const [mapCenter, setMapCenter] = useState({ lat: 12.9343, lng: 77.6043 });

  useEffect(() => {
    fetchNearbyCenters();
    getUserLocation();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [centers, filterType, searchQuery]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Using default location');
        }
      );
    }
  };

  const fetchNearbyCenters = async () => {
    try {
      const response = await axios.get('/api/nearby-centers', { withCredentials: true });
      setCenters(response.data.centers || []);
    } catch (error) {
      console.error('Error fetching centers:', error);
      // Use mock data if API fails
      setCenters(getMockCenters());
    } finally {
      setLoading(false);
    }
  };

  const getMockCenters = () => {
    return [
      {
        id: 1,
        name: 'Banashankari Rehabilitation Center',
        type: 'rehab',
        address: 'Near BSNL Office, 17th Main, Banashankari 2nd Stage, Bengaluru 560070',
        phone: '+91 80 2661 2345',
        distance: 0.8,
        rating: 4.8,
        reviews: 245,
        hours: 'Mon-Fri: 7AM-7PM, Sat: 8AM-4PM',
        services: ['Physical Therapy', 'Occupational Therapy', 'Speech Therapy'],
        lat: 12.9280,
        lng: 77.5985,
        image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop'
      },
      {
        id: 2,
        name: 'PES Physiotherapy & Sports Clinic',
        type: 'physio',
        address: '100 Feet Ring Road, Near PES University, Banashankari, Bengaluru 560085',
        phone: '+91 80 2679 8888',
        distance: 0.5,
        rating: 4.9,
        reviews: 312,
        hours: 'Mon-Sat: 8AM-8PM, Sun: 9AM-2PM',
        services: ['Sports Rehabilitation', 'Manual Therapy', 'Dry Needling', 'Athletic Training'],
        lat: 12.9350,
        lng: 77.6050,
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop'
      },
      {
        id: 3,
        name: 'South Bangalore Recovery & Wellness',
        type: 'rehab',
        address: 'Kanakapura Road, Uttarahalli, Bengaluru 560061',
        phone: '+91 80 2326 7890',
        distance: 2.1,
        rating: 4.7,
        reviews: 189,
        hours: 'Mon-Fri: 6AM-9PM, Sat-Sun: 8AM-6PM',
        services: ['Post-Surgery Rehab', 'Pain Management', 'Aquatic Therapy', 'Neurological Rehab'],
        lat: 12.9180,
        lng: 77.5890,
        image: 'https://images.unsplash.com/photo-1519494140681-8b17d830a3e9?w=400&h=300&fit=crop'
      },
      {
        id: 4,
        name: 'Padmanabhanagar Physiotherapy Center',
        type: 'physio',
        address: 'Mysore Road, Padmanabhanagar, Bengaluru 560070',
        phone: '+91 80 2669 4455',
        distance: 1.3,
        rating: 4.6,
        reviews: 156,
        hours: 'Mon-Fri: 7AM-8PM, Sat: 8AM-5PM',
        services: ['Orthopedic PT', 'Geriatric Therapy', 'Balance Training', 'Home Visits'],
        lat: 12.9220,
        lng: 77.5920,
        image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop'
      },
      {
        id: 5,
        name: 'JP Nagar Sports Rehabilitation',
        type: 'rehab',
        address: '24th Main Road, JP Nagar 5th Phase, Bengaluru 560078',
        phone: '+91 80 2659 3366',
        distance: 3.2,
        rating: 4.9,
        reviews: 401,
        hours: 'Mon-Sun: 6AM-10PM',
        services: ['Sports Medicine', 'Athletic Training', 'Injury Prevention', 'Performance Enhancement'],
        lat: 12.9070,
        lng: 77.5870,
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'
      },
      {
        id: 6,
        name: 'Jayanagar Healing Hands Physiotherapy',
        type: 'physio',
        address: '9th Block, Jayanagar, Near Madhavan Park, Bengaluru 560069',
        phone: '+91 80 2663 7788',
        distance: 2.5,
        rating: 4.8,
        reviews: 278,
        hours: 'Mon-Sat: 7AM-7PM',
        services: ['Neurological PT', 'Pediatric Therapy', 'Women\'s Health', 'Geriatric Care'],
        lat: 12.9250,
        lng: 77.5950,
        image: 'https://images.unsplash.com/photo-1578496479914-7ef3b0193be3?w=400&h=300&fit=crop'
      }
    ];
  };

  const applyFilters = () => {
    let filtered = centers;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(center => center.type === filterType);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(center =>
        center.name.toLowerCase().includes(query) ||
        center.address.toLowerCase().includes(query) ||
        center.services.some(service => service.toLowerCase().includes(query))
      );
    }

    // Sort by distance
    filtered.sort((a, b) => a.distance - b.distance);

    setFilteredCenters(filtered);
  };

  const handleGetDirections = (center) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`;
    window.open(url, '_blank');
  };

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <MapPin className="mr-3 text-blue-600" size={32} />
                Find Nearby Centers
              </h1>
              <p className="text-gray-600 mt-2">Discover rehabilitation and physiotherapy centers near you</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, location, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  filterType === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Centers
              </button>
              <button
                onClick={() => setFilterType('rehab')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  filterType === 'rehab'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rehab
              </button>
              <button
                onClick={() => setFilterType('physio')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  filterType === 'physio'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Physiotherapy
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Found <span className="font-semibold text-gray-900">{filteredCenters.length}</span> center{filteredCenters.length !== 1 ? 's' : ''} near you
          </p>
        </div>

        {/* Centers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCenters.map((center) => (
            <div
              key={center.id}
              className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer ${
                selectedCenter?.id === center.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedCenter(center)}
            >
              {/* Center Image */}
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                <img
                  src={center.image}
                  alt={center.name}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-white text-sm font-medium ${
                  center.type === 'rehab' ? 'bg-green-600' : 'bg-purple-600'
                }`}>
                  {center.type === 'rehab' ? 'Rehabilitation' : 'Physiotherapy'}
                </div>
                <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-sm font-semibold text-gray-900">
                  {center.distance} km away
                </div>
              </div>

              {/* Center Details */}
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{center.name}</h3>

                {/* Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < Math.floor(center.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {center.rating} ({center.reviews} reviews)
                  </span>
                </div>

                {/* Address */}
                <div className="flex items-start mb-3">
                  <MapPin className="text-gray-400 mr-2 flex-shrink-0 mt-1" size={18} />
                  <p className="text-gray-600 text-sm">{center.address}</p>
                </div>

                {/* Phone */}
                <div className="flex items-center mb-3">
                  <Phone className="text-gray-400 mr-2" size={18} />
                  <p className="text-gray-600 text-sm">{center.phone}</p>
                </div>

                {/* Hours */}
                <div className="flex items-center mb-4">
                  <Clock className="text-gray-400 mr-2" size={18} />
                  <p className="text-gray-600 text-sm">{center.hours}</p>
                </div>

                {/* Services */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Services:</p>
                  <div className="flex flex-wrap gap-2">
                    {center.services.map((service, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGetDirections(center);
                    }}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Navigation size={18} className="mr-2" />
                    Directions
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCall(center.phone);
                    }}
                    className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Phone size={18} className="mr-2" />
                    Call Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredCenters.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <MapPin className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No centers found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Interactive Map Placeholder */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Map View</h2>
          {/* Real Google Maps Integration */}
          <div className="rounded-lg overflow-hidden shadow-lg">
            <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyBCgOtR8K-z7VZxYqYqYqYqYqYqYqYqYqY"}>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '450px' }}
                center={mapCenter}
                zoom={13}
                options={{
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: true,
                  fullscreenControl: true,
                }}
              >
                {/* User Location Marker */}
                <Marker
                  position={userLocation}
                  icon={{
                    path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                    scale: 10,
                    fillColor: '#4F46E5',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 3,
                  }}
                  title="Your Location"
                />

                {/* Center Markers */}
                {filteredCenters.map((center) => (
                  <Marker
                    key={center.id}
                    position={{ lat: center.lat, lng: center.lng }}
                    onClick={() => setSelectedMarker(center)}
                    icon={{
                      url: center.type === 'rehab' 
                        ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                        : 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png',
                    }}
                    title={center.name}
                  />
                ))}

                {/* InfoWindow for selected marker */}
                {selectedMarker && (
                  <InfoWindow
                    position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                    onCloseClick={() => setSelectedMarker(null)}
                  >
                    <div className="p-2 max-w-xs">
                      <h3 className="font-bold text-gray-900 mb-1">{selectedMarker.name}</h3>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Star className="text-yellow-400 mr-1" size={14} fill="currentColor" />
                        <span>{selectedMarker.rating} ({selectedMarker.reviews} reviews)</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{selectedMarker.address}</p>
                      <p className="text-sm font-medium text-blue-600 mb-2">{selectedMarker.distance} km away</p>
                      <div className="flex gap-2">
                        <a
                          href={`tel:${selectedMarker.phone}`}
                          className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          Call
                        </a>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMarker.lat},${selectedMarker.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                          Directions
                        </a>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </LoadScript>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="inline-flex items-center mr-4">
                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                Rehabilitation Centers
              </span>
              <span className="inline-flex items-center">
                <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                Physiotherapy Centers
              </span>
            </p>
            <button
              onClick={() => {
                setMapCenter(userLocation);
                getUserLocation();
              }}
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Navigation size={16} />
              Center on Me
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyRehabCenters;

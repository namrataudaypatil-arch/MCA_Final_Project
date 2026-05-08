import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getCars, addCar, updateCar, deleteCar } from '../services/api';

const EMPTY_FORM = {
  name: '', type: '', price: '', seats: '', year: '',
  fuel: '', imageUrl: '', brand: '', transmission: 'Automatic', description: ''
};

function AdminCars() {
  const [cars, setCars] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const loadCars = async () => {
    setLoading(true);
    try {
      const response = await getCars(); // public endpoint, no auth needed
      if (response.data.success) {
        setCars(response.data.cars);
      } else {
        toast.error('Failed to load cars');
      }
    } catch (error) {
      console.error('Error loading cars:', error);
      toast.error('Error loading cars');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCars(); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'imageUrl') setPreviewImage(value);
  };

  const buildCarPayload = () => ({
    name: formData.name,
    brand: formData.brand || formData.name.split(' ')[0],
    type: formData.type,
    price_per_day: parseInt(formData.price),
    seats: parseInt(formData.seats),
    year: parseInt(formData.year),
    fuel_type: formData.fuel,
    transmission: formData.transmission || 'Automatic',
    image_url: formData.imageUrl,
    description: formData.description || `${formData.name} — premium car rental`,
  });

  const handleAddCar = async () => {
    if (!formData.name || !formData.price || !formData.seats) {
      toast.error('Please fill in all required fields'); return;
    }
    try {
      const response = await addCar(buildCarPayload()); // JWT attached automatically
      if (response.data.success) {
        toast.success('Car added successfully!');
        setShowAddForm(false);
        setFormData(EMPTY_FORM);
        setPreviewImage('');
        loadCars();
      } else {
        toast.error(response.data.message || 'Failed to add car');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding car');
    }
  };

  const handleEditCar = (car) => {
    setEditingCar(car);
    setFormData({
      name: car.name, brand: car.brand || '', type: car.type,
      price: car.price_per_day, seats: car.seats, year: car.year,
      fuel: car.fuel_type, transmission: car.transmission || 'Automatic',
      imageUrl: car.image_url || '', description: car.description || '',
    });
    setPreviewImage(car.image_url || '');
  };

  const handleUpdateCar = async () => {
    try {
      const response = await updateCar(editingCar.id, buildCarPayload()); // JWT attached automatically
      if (response.data.success) {
        toast.success('Car updated successfully!');
        setEditingCar(null);
        setFormData(EMPTY_FORM);
        setPreviewImage('');
        loadCars();
      } else {
        toast.error(response.data.message || 'Failed to update car');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating car');
    }
  };

  const handleDeleteCar = async (id) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;
    try {
      const response = await deleteCar(id); // JWT attached automatically
      if (response.data.success) {
        toast.success('Car deleted successfully!');
        loadCars();
      } else {
        toast.error(response.data.message || 'Failed to delete car');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting car');
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(price);

  const CarFormFields = () => (
    <div className="grid md:grid-cols-2 gap-4">
      <input type="text" name="name" placeholder="Car Name *" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" />
      <input type="text" name="brand" placeholder="Brand" value={formData.brand} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" />
      <input type="text" name="type" placeholder="Type (SUV, Luxury, etc.) *" value={formData.type} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" />
      <input type="number" name="price" placeholder="Price per day (₹) *" value={formData.price} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" />
      <input type="number" name="seats" placeholder="Number of Seats *" value={formData.seats} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" />
      <input type="number" name="year" placeholder="Year" value={formData.year} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" />
      <input type="text" name="fuel" placeholder="Fuel Type (Petrol, Diesel, Electric)" value={formData.fuel} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" />
      <select name="transmission" value={formData.transmission} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg">
        <option>Automatic</option>
        <option>Manual</option>
      </select>
      <div className="md:col-span-2">
        <label className="block text-gray-700 font-semibold mb-1">Image URL</label>
        <input type="text" name="imageUrl" placeholder="https://example.com/car.jpg" value={formData.imageUrl} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" />
        <p className="text-xs text-gray-500 mt-1">Use Unsplash, Pixabay, or any direct image URL</p>
      </div>
      <div className="md:col-span-2">
        <label className="block text-gray-700 font-semibold mb-1">Description</label>
        <textarea name="description" placeholder="Short car description" value={formData.description} onChange={handleInputChange} rows={2} className="w-full px-4 py-2 border rounded-lg resize-none" />
      </div>
      {previewImage && (
        <div className="md:col-span-2 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-semibold mb-2">Image Preview:</p>
          <img
            src={previewImage}
            alt="Preview"
            className="w-32 h-24 object-cover rounded-lg"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/128x96?text=Invalid+URL'; }}
          />
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Manage Cars</h1>
            <p className="text-gray-500">Add, edit, or remove cars from your fleet</p>
          </div>
          <button
            onClick={() => { setShowAddForm(true); setFormData(EMPTY_FORM); setPreviewImage(''); }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + Add New Car
          </button>
        </div>

        {/* Add Car Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Add New Car</h2>
              <CarFormFields />
              <div className="flex gap-3 mt-6">
                <button onClick={handleAddCar} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">Add Car</button>
                <button onClick={() => { setShowAddForm(false); setPreviewImage(''); }} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Car Modal */}
        {editingCar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Edit Car — {editingCar.name}</h2>
              <CarFormFields />
              <div className="flex gap-3 mt-6">
                <button onClick={handleUpdateCar} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">Update Car</button>
                <button onClick={() => { setEditingCar(null); setPreviewImage(''); }} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Cars Table */}
        {cars.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Cars in Fleet</h2>
            <p className="text-gray-600">Add your first car to get started.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="p-3 text-left">Image</th>
                    <th className="p-3 text-left">Car</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Price/Day</th>
                    <th className="p-3 text-left">Seats</th>
                    <th className="p-3 text-left">Year</th>
                    <th className="p-3 text-left">Fuel</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => (
                    <tr key={car.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <img
                          src={car.image_url || 'https://via.placeholder.com/50?text=No+Img'}
                          alt={car.name}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/50?text=No+Img'; }}
                        />
                      </td>
                      <td className="p-3">
                        <p className="font-semibold">{car.name}</p>
                        <p className="text-xs text-gray-500">{car.brand}</p>
                      </td>
                      <td className="p-3">{car.type}</td>
                      <td className="p-3">{formatPrice(car.price_per_day)}</td>
                      <td className="p-3">{car.seats}</td>
                      <td className="p-3">{car.year}</td>
                      <td className="p-3">{car.fuel_type}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => handleEditCar(car)} className="text-blue-600 hover:text-blue-800 mr-3">✏️ Edit</button>
                        <button onClick={() => handleDeleteCar(car.id)} className="text-red-600 hover:text-red-800">🗑️ Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCars;
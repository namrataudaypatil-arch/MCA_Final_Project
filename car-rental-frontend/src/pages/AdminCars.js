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
      <input type="text" name="name" placeholder="Car Name *" value={formData.name} onChange={handleInputChange} className="w-full px-5 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300" />
      <input type="text" name="brand" placeholder="Brand" value={formData.brand} onChange={handleInputChange} className="w-full px-5 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300" />
      <input type="text" name="type" placeholder="Type (SUV, Luxury, etc.) *" value={formData.type} onChange={handleInputChange} className="w-full px-5 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300" />
      <input type="number" name="price" placeholder="Price per day (₹) *" value={formData.price} onChange={handleInputChange} className="w-full px-5 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300" />
      <input type="number" name="seats" placeholder="Number of Seats *" value={formData.seats} onChange={handleInputChange} className="w-full px-5 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300" />
      <input type="number" name="year" placeholder="Year" value={formData.year} onChange={handleInputChange} className="w-full px-5 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300" />
      <input type="text" name="fuel" placeholder="Fuel Type (Petrol, Diesel, Electric)" value={formData.fuel} onChange={handleInputChange} className="w-full px-5 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300" />
      <select name="transmission" value={formData.transmission} onChange={handleInputChange} className="w-full px-5 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300">
        <option>Automatic</option>
        <option>Manual</option>
      </select>
      <div className="md:col-span-2">
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1 transition-colors duration-300">Image URL</label>
        <input type="text" name="imageUrl" placeholder="https://example.com/car.jpg" value={formData.imageUrl} onChange={handleInputChange} className="w-full px-5 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300" />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">Use Unsplash, Pixabay, or any direct image URL</p>
      </div>
      <div className="md:col-span-2">
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1 transition-colors duration-300">Description</label>
        <textarea name="description" placeholder="Short car description" value={formData.description} onChange={handleInputChange} rows={2} className="w-full px-5 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 resize-none" />
      </div>
      {previewImage && (
        <div className="md:col-span-2 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl transition-colors duration-300">
          <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300 transition-colors duration-300">Image Preview:</p>
          <img
            src={previewImage}
            alt="Preview"
            className="w-32 h-24 object-cover rounded-xl shadow-md"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/128x96?text=Invalid+URL'; }}
          />
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-slate-900 min-h-screen flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Loading cars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen py-12 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Manage Cars</h1>
            <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">Add, edit, or remove cars from your fleet</p>
          </div>
          <button
            onClick={() => { setShowAddForm(true); setFormData(EMPTY_FORM); setPreviewImage(''); }}
            className="bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg transform hover:-translate-y-1 transition duration-300 flex items-center gap-2"
          >
            <span>+</span> Add New Car
          </button>
        </div>

        {/* Add Car Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto transition-all duration-300">
            <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto shadow-2xl transition-colors duration-300">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white transition-colors duration-300">Add New Car</h2>
              <CarFormFields />
              <div className="flex gap-4 mt-8">
                <button onClick={handleAddCar} className="flex-1 bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white py-3 rounded-xl font-bold shadow-md transition duration-300">Add Car</button>
                <button onClick={() => { setShowAddForm(false); setPreviewImage(''); }} className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-white py-3 rounded-xl font-bold transition duration-300">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Car Modal */}
        {editingCar && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto transition-all duration-300">
            <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto shadow-2xl transition-colors duration-300">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white transition-colors duration-300">Edit Car — <span className="text-blue-600 dark:text-blue-400">{editingCar.name}</span></h2>
              <CarFormFields />
              <div className="flex gap-4 mt-8">
                <button onClick={handleUpdateCar} className="flex-1 bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white py-3 rounded-xl font-bold shadow-md transition duration-300">Update Car</button>
                <button onClick={() => { setEditingCar(null); setPreviewImage(''); }} className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-white py-3 rounded-xl font-bold transition duration-300">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Cars Table */}
        {cars.length === 0 ? (
          <div className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl p-12 text-center transition-colors duration-300">
            <div className="text-6xl mb-4">🚗</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 transition-colors duration-300">No Cars in Fleet</h2>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Add your first car to get started.</p>
          </div>
        ) : (
          <div className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl overflow-hidden transition-colors duration-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
                  <tr>
                    <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Image</th>
                    <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Car</th>
                    <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Type</th>
                    <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Price/Day</th>
                    <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Seats</th>
                    <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Year</th>
                    <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Fuel</th>
                    <th className="p-4 text-center font-bold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700 transition-colors duration-300">
                  {cars.map((car) => (
                    <tr key={car.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-300">
                      <td className="p-4">
                        <img
                          src={car.image_url || 'https://via.placeholder.com/50?text=No+Img'}
                          alt={car.name}
                          className="w-16 h-12 object-cover rounded-xl shadow-sm"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/50?text=No+Img'; }}
                        />
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-gray-900 dark:text-white transition-colors duration-300">{car.name}</p>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 transition-colors duration-300">{car.brand}</p>
                      </td>
                      <td className="p-4 text-gray-700 dark:text-gray-300 transition-colors duration-300">{car.type}</td>
                      <td className="p-4 font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300">{formatPrice(car.price_per_day)}</td>
                      <td className="p-4 text-gray-700 dark:text-gray-300 transition-colors duration-300">{car.seats}</td>
                      <td className="p-4 text-gray-700 dark:text-gray-300 transition-colors duration-300">{car.year}</td>
                      <td className="p-4 text-gray-700 dark:text-gray-300 transition-colors duration-300">{car.fuel_type}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => handleEditCar(car)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors duration-300">✏️ Edit</button>
                          <button onClick={() => handleDeleteCar(car.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-semibold transition-colors duration-300">🗑️ Delete</button>
                        </div>
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
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const AdminProductForm = () => {
  const { id } = useParams(); // product id for edit mode
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    status: "active"
  });

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch product details if editing
  useEffect(() => {
    if (id) {
      setLoading(true);
      api
        .get(`/products/${id}`)
        .then((res) => {
          setForm({
            title: res.data.title || "",
            description: res.data.description || "",
            price: res.data.price || "",
            category: res.data.category || "",
            stock: res.data.stock || "",
            status: res.data.status || "active"
          });
          setExistingImages(res.data.images || []);
        })
        .catch(() => setError("Failed to fetch product"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    
    // Append form fields
    Object.keys(form).forEach(key => {
      formData.append(key, form[key]);
    });

    // Append new images if any
    images.forEach(image => {
      formData.append('images', image);
    });

    // Always send existing images array (even if empty after removals)
    formData.append('existingImages', JSON.stringify(existingImages));

    // Debug: Log what we're sending
    console.log('Submitting form with:');
    console.log('Existing images:', existingImages);
    console.log('New images count:', images.length);

    const method = id ? "put" : "post";
    const url = `/admin/products${id ? `/${id}` : ""}`;

    api[method](url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })
      .then((response) => {
        console.log('Server response:', response.data);
        navigate("/admin/products");
      })
      .catch((err) => {
        console.error('Error:', err.response?.data);
        setError(err.response?.data?.message || "Something went wrong");
      })
      .finally(() => setLoading(false));
  };  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6 mt-6">
      <h1 className="text-2xl font-bold mb-4">
        {id ? "Edit Product" : "Create Product"}
      </h1>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Product Title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />
        <textarea
          name="description"
          placeholder="Product Description"
          value={form.description}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded h-24"
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          name="stock"
          placeholder="Stock Quantity"
          value={form.stock}
          onChange={handleChange}
          required
          min="0"
          className="w-full border p-2 rounded"
        />
        
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Current Images</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {existingImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={image} 
                    alt={`Product ${index + 1}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Click the × button on any image to remove it
            </p>
          </div>
        )}

        {/* New Images Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {id ? "Upload New Images (will replace current images)" : "Upload Images"}
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border p-2 rounded"
          />
          <p className="text-sm text-gray-500 mt-1">
            You can select multiple images (max 5). Supported formats: JPG, PNG, WebP
          </p>
        </div>

        {/* Preview new images */}
        {images.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">New Images Preview</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={URL.createObjectURL(image)} 
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              These images will be added to the product. Click × to remove any unwanted images.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
        >
          {loading ? "Saving..." : id ? "Update Product" : "Create Product"}
        </button>
      </form>
    </div>
  );
};

export default AdminProductForm;

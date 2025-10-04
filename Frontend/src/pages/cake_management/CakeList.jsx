// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import "./CakeList.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CakeList = () => {
  const url = "http://localhost:5000/api/cakes";
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    cakeId: null,
    cakeName: "",
  });
  const navigate = useNavigate();

  // Fetch list of cakes
  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(url);
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Error fetching cake list");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const removeCake = async (cakeId) => {
    try {
      const response = await axios.delete(`${url}/${cakeId}`);
      if (response.data.success) {
        toast.success("Cake deleted successfully");
        await fetchList();
        setDeleteModal({ show: false, cakeId: null, cakeName: "" });
      } else {
        toast.error("Error deleting cake");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error deleting cake");
    }
  };

  const handleDeleteClick = (cakeId, cakeName) => {
    setDeleteModal({ show: true, cakeId, cakeName });
  };

  const handleEditClick = (cakeId) => {
    navigate(`/admin/editcake/${cakeId}`);
  };

  const confirmDelete = () => {
    if (deleteModal.cakeId) {
      removeCake(deleteModal.cakeId);
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ show: false, cakeId: null, cakeName: "" });
  };

  // useEffect to call fetchList on component mount
  useEffect(() => {
    fetchList();
  }, []); // Empty dependency array means it will run once after initial render

  return (
    <>
      <div className="cake-list-container">
        {/* Header Section */}
        <div className="cake-list-header">
          <h1 className="cake-list-title">Cake Inventory</h1>
          <p className="cake-list-subtitle">
            Manage your cake collection with ease
          </p>
          <div className="cake-list-stats">
            <div className="stat-item">
              <span className="stat-number">{list.length}</span>
              <span className="stat-label">Total Cakes</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {list.filter((cake) => cake.qty > 0).length}
              </span>
              <span className="stat-label">In Stock</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {list.filter((cake) => cake.qty === 0).length}
              </span>
              <span className="stat-label">Out of Stock</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="cake-list-content">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading cakes...</p>
            </div>
          ) : list.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎂</div>
              <h3>No Cakes Found</h3>
              <p>Start by adding your first cake to the inventory</p>
              <button
                className="add-first-cake-btn"
                onClick={() => navigate("/admin/addcake")}
              >
                Add Your First Cake
              </button>
            </div>
          ) : (
            <div className="cake-grid">
              {list.map((item) => (
                <div
                  key={item._id}
                  className={`cake-card ${
                    item.qty === 0 ? "out-of-stock" : ""
                  }`}
                >
                  <div className="cake-image-container">
                    <img
                      src={`http://localhost:5000/uploads/${item.image}`}
                      alt={item.productName}
                      className="cake-image"
                    />
                    {item.qty === 0 && (
                      <div className="out-of-stock-overlay">Out of Stock</div>
                    )}
                  </div>

                  <div className="cake-details">
                    <h3 className="cake-name">{item.productName}</h3>
                    <p className="cake-category">{item.category}</p>
                    <p className="cake-description">{item.description}</p>

                    {/* Toppings Section */}
                    {item.toppings && item.toppings.length > 0 && (
                      <div className="toppings-section">
                        <span className="toppings-label">
                          Available Toppings:
                        </span>
                        <div className="toppings-list">
                          {item.toppings.map((topping, index) => (
                            <span key={index} className="topping-item">
                              {topping.name} (+Rs.{topping.price})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="cake-info">
                      <div className="price-info">
                        <span className="price-label">Price</span>
                        <span className="price-value">Rs{item.price}</span>
                      </div>
                      <div className="quantity-info">
                        <span className="quantity-label">Stock</span>
                        <span
                          className={`quantity-value ${
                            item.qty === 0
                              ? "zero"
                              : item.qty < 5
                              ? "low"
                              : "good"
                          }`}
                        >
                          {item.qty}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="cake-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEditClick(item._id)}
                      title="Edit cake"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() =>
                        handleDeleteClick(item._id, item.productName)
                      }
                      title="Delete cake"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
            </div>
            <div className="modal-body">
              <div className="warning-icon">⚠️</div>
              <p>
                Are you sure you want to delete{" "}
                <strong>"{deleteModal.cakeName}"</strong>?
              </p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="confirm-delete-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CakeList;

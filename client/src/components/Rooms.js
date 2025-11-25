import React, { useState, useEffect } from 'react';
import { roomsAPI } from '../api';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    room_number: '',
    floor: '',
    capacity: '',
    status: 'available'
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await roomsAPI.getAll();
      setRooms(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      
      const submitData = {
        ...formData,
        floor: parseInt(formData.floor),
        capacity: parseInt(formData.capacity)
      };
      
      if (editingRoom) {
        await roomsAPI.update(editingRoom.id, submitData);
        setSuccess('Room updated successfully!');
      } else {
        await roomsAPI.create(submitData);
        setSuccess('Room created successfully!');
      }
      
      setShowModal(false);
      setEditingRoom(null);
      setFormData({
        room_number: '',
        floor: '',
        capacity: '',
        status: 'available'
      });
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save room');
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      room_number: room.room_number,
      floor: room.floor.toString(),
      capacity: room.capacity.toString(),
      status: room.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await roomsAPI.delete(id);
        setSuccess('Room deleted successfully!');
        fetchRooms();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete room');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRoom(null);
    setFormData({
      room_number: '',
      floor: '',
      capacity: '',
      status: 'available'
    });
    setError('');
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: 'badge-available',
      full: 'badge-full',
      maintenance: 'badge-maintenance'
    };
    return badges[status] || '';
  };

  if (loading) {
    return <div className="loading">Loading rooms...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Rooms</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Room
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="card">
        {rooms.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏠</div>
            <p>No rooms found. Add your first room!</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Room Number</th>
                  <th>Floor</th>
                  <th>Capacity</th>
                  <th>Occupied</th>
                  <th>Available</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id}>
                    <td><strong>{room.room_number}</strong></td>
                    <td>{room.floor}</td>
                    <td>{room.capacity}</td>
                    <td>{room.occupied}</td>
                    <td>{room.capacity - room.occupied}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(room.status)}`}>
                        {room.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-secondary btn-small"
                          onClick={() => handleEdit(room)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => handleDelete(room.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </h3>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Room Number *</label>
                <input
                  type="text"
                  name="room_number"
                  className="form-input"
                  value={formData.room_number}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Floor *</label>
                <input
                  type="number"
                  name="floor"
                  className="form-input"
                  value={formData.floor}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Capacity *</label>
                <input
                  type="number"
                  name="capacity"
                  className="form-input"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="available">Available</option>
                  <option value="full">Full</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              {error && <div className="error">{error}</div>}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingRoom ? 'Update' : 'Create'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;


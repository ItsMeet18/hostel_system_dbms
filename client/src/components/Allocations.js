import React, { useState, useEffect } from 'react';
import { allocationsAPI, studentsAPI, roomsAPI } from '../api';

const Allocations = () => {
  const [allocations, setAllocations] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    student_id: '',
    room_id: '',
    allocation_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allocationsRes, studentsRes, roomsRes] = await Promise.all([
        allocationsAPI.getAll(),
        studentsAPI.getAll(),
        roomsAPI.getAll()
      ]);
      setAllocations(allocationsRes.data);
      setStudents(studentsRes.data);
      setRooms(roomsRes.data.filter(room => room.status === 'available' || room.occupied < room.capacity));
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch data');
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
      
      await allocationsAPI.create(formData);
      setSuccess('Allocation created successfully!');
      
      setShowModal(false);
      setFormData({
        student_id: '',
        room_id: '',
        allocation_date: new Date().toISOString().split('T')[0]
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create allocation');
    }
  };

  const handleComplete = async (id) => {
    if (window.confirm('Are you sure you want to complete this allocation?')) {
      try {
        await allocationsAPI.update(id, { status: 'completed' });
        setSuccess('Allocation completed successfully!');
        fetchData();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to complete allocation');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this allocation?')) {
      try {
        await allocationsAPI.delete(id);
        setSuccess('Allocation deleted successfully!');
        fetchData();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete allocation');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      student_id: '',
      room_id: '',
      allocation_date: new Date().toISOString().split('T')[0]
    });
    setError('');
  };

  const getStatusBadge = (status) => {
    return status === 'active' ? 'badge-active' : 'badge-completed';
  };

  // Filter out students who already have active allocations
  const availableStudents = students.filter(student => {
    return !allocations.some(
      alloc => alloc.student_id === student.id && alloc.status === 'active'
    );
  });

  if (loading) {
    return <div className="loading">Loading allocations...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Room Allocations</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Allocate Room
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="card">
        {allocations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p>No allocations found. Create your first allocation!</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Enrollment #</th>
                  <th>Room Number</th>
                  <th>Floor</th>
                  <th>Allocation Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((allocation) => (
                  <tr key={allocation.id}>
                    <td><strong>{allocation.student_name}</strong></td>
                    <td>{allocation.enrollment_number}</td>
                    <td>{allocation.room_number}</td>
                    <td>{allocation.floor}</td>
                    <td>{new Date(allocation.allocation_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(allocation.status)}`}>
                        {allocation.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {allocation.status === 'active' && (
                          <button
                            className="btn btn-secondary btn-small"
                            onClick={() => handleComplete(allocation.id)}
                          >
                            Complete
                          </button>
                        )}
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => handleDelete(allocation.id)}
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
              <h3 className="modal-title">Allocate Room</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Student *</label>
                <select
                  name="student_id"
                  className="form-select"
                  value={formData.student_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a student</option>
                  {availableStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.enrollment_number})
                    </option>
                  ))}
                </select>
                {availableStudents.length === 0 && (
                  <small style={{ color: '#f56565' }}>
                    No available students (all students are already allocated)
                  </small>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Room *</label>
                <select
                  name="room_id"
                  className="form-select"
                  value={formData.room_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.room_number} (Floor {room.floor}) - {room.capacity - room.occupied} available
                    </option>
                  ))}
                </select>
                {rooms.length === 0 && (
                  <small style={{ color: '#f56565' }}>
                    No available rooms
                  </small>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Allocation Date *</label>
                <input
                  type="date"
                  name="allocation_date"
                  className="form-input"
                  value={formData.allocation_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {error && <div className="error">{error}</div>}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={availableStudents.length === 0 || rooms.length === 0}>
                  Allocate
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

export default Allocations;


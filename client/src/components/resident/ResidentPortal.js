import React, { useEffect, useState } from 'react';
import { residentPortalAPI } from '../../api';

const ResidentPortal = ({ user, onLogout }) => {
  const residentId = user?.resident?.resident_id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [complaint, setComplaint] = useState('');
  const [laundryDate, setLaundryDate] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!residentId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await residentPortalAPI.getDashboard(residentId);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [residentId]);

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    try {
      await residentPortalAPI.createMaintenance(residentId, { issue_description: complaint });
      setComplaint('');
      setSuccess('Maintenance request submitted!');
      const response = await residentPortalAPI.getDashboard(residentId);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request');
    }
  };

  const handleLaundrySubmit = async (e) => {
    e.preventDefault();
    try {
      await residentPortalAPI.createLaundry(residentId, { service_date: laundryDate });
      setLaundryDate('');
      setSuccess('Laundry request added!');
      const response = await residentPortalAPI.getDashboard(residentId);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create laundry request');
    }
  };

  if (loading) {
    return <div className="loading">Loading your portal...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const { resident, room, bills, maintenance, laundry } = data || {};

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h2 className="page-title">Welcome back, {resident?.name}</h2>
          <p className="muted">Here is a quick overview of your stay</p>
        </div>
        <button className="btn btn-secondary" onClick={onLogout}>
          Logout
        </button>
      </div>

      {success && (
        <div className="success">
          {success}
          <button className="link-btn" onClick={() => setSuccess('')}>
            ×
          </button>
        </div>
      )}

      <div className="grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Personal Information</h3>
          </div>
          <div className="info-list">
            <div>
              <span className="muted">Resident ID</span>
              <p>{resident?.resident_id}</p>
            </div>
            <div>
              <span className="muted">Contact</span>
              <p>{resident?.contact_number}</p>
            </div>
            <div>
              <span className="muted">Emergency Contact</span>
              <p>{resident?.emergency_contact || 'Not set'}</p>
            </div>
            <div>
              <span className="muted">Mess Plan</span>
              <p>
                {resident?.plan_type ? `${resident.plan_type} • ₹${resident.cost}` : 'Not assigned'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Room & Hostel</h3>
          </div>
          {room ? (
            <div className="info-list">
              <div>
                <span className="muted">Room Number</span>
                <p>{room.room_number}</p>
              </div>
              <div>
                <span className="muted">Room Type</span>
                <p>{room.room_type}</p>
              </div>
              <div>
                <span className="muted">Hostel</span>
                <p>{room.hostel_name}</p>
              </div>
              <div>
                <span className="muted">Check-in</span>
                <p>{new Date(room.check_in_date).toLocaleDateString()}</p>
              </div>
            </div>
          ) : (
            <p className="muted">No active room allocation.</p>
          )}
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Bills</h3>
          </div>
          {bills?.length ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Due Date</th>
                    <th>Rent</th>
                    <th>Charges</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr key={bill.bill_id}>
                      <td>{new Date(bill.due_date).toLocaleDateString()}</td>
                      <td>₹{bill.monthly_rent}</td>
                      <td>₹{bill.additional_charges}</td>
                      <td>
                        <span className={`badge badge-${bill.status}`}>
                          {bill.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted">No bills found.</p>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Maintenance Requests</h3>
          </div>
          {maintenance?.length ? (
            <ul className="timeline">
              {maintenance.map((item) => (
                <li key={item.request_id}>
                  <div className="timeline-title">{item.issue_description}</div>
                  <div className={`badge badge-${item.complaint_status}`}>
                    {item.complaint_status}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No requests yet.</p>
          )}
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Raise a Complaint</h3>
          </div>
          <form onSubmit={handleComplaintSubmit}>
            <div className="form-group">
              <textarea
                className="form-input"
                rows="4"
                placeholder="Describe the issue..."
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Submit Request
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Laundry Service</h3>
          </div>
          <form onSubmit={handleLaundrySubmit}>
            <div className="form-group">
              <label className="form-label">Preferred Date</label>
              <input
                type="date"
                className="form-input"
                value={laundryDate}
                onChange={(e) => setLaundryDate(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Request Laundry
            </button>
          </form>
          {laundry?.length ? (
            <ul className="timeline">
              {laundry.map((item) => (
                <li key={item.laundry_id}>
                  <div className="timeline-title">
                    {new Date(item.service_date).toLocaleDateString()}
                  </div>
                  <div className={`badge badge-${item.status}`}>{item.status}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No laundry history yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResidentPortal;


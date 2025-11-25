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
  const [profileForm, setProfileForm] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [selectingRoom, setSelectingRoom] = useState(false);

  useEffect(() => {
    if (!residentId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await residentPortalAPI.getDashboard(residentId);
        setData(response.data);
        const residentProfile = response.data.resident;
        setProfileForm({
          name: residentProfile?.name || '',
          gender: residentProfile?.gender || 'male',
          contact_number: residentProfile?.contact_number || '',
          emergency_contact: residentProfile?.emergency_contact || '',
          email: residentProfile?.email || '',
          hostel_id: residentProfile?.hostel_id || '',
          mess_plan_id: residentProfile?.mess_plan_id || '',
          roommate_type: residentProfile?.roommate_type || 'quiet',
        });
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

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setSuccess('');
      const updateResponse = await residentPortalAPI.updateProfile(residentId, profileForm);
      const dashboardResponse = await residentPortalAPI.getDashboard(residentId);
      setData(dashboardResponse.data);
      // Update profile form with the updated resident data
      const updatedResident = updateResponse.data;
      setProfileForm({
        name: updatedResident?.name || '',
        gender: updatedResident?.gender || 'male',
        contact_number: updatedResident?.contact_number || '',
        emergency_contact: updatedResident?.emergency_contact || '',
        email: updatedResident?.email || '',
        hostel_id: updatedResident?.hostel_id || '',
        mess_plan_id: updatedResident?.mess_plan_id || '',
        roommate_type: updatedResident?.roommate_type || 'quiet',
      });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRoomSelection = async (roomId) => {
    if (window.confirm('Are you sure you want to select this room? This action cannot be undone.')) {
      try {
        setSelectingRoom(true);
        await residentPortalAPI.selectRoom(residentId, { room_id: roomId });
        setSuccess('Room selected successfully!');
        const response = await residentPortalAPI.getDashboard(residentId);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to select room');
      } finally {
        setSelectingRoom(false);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading your portal...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const {
    resident,
    room,
    bills,
    maintenance,
    laundry,
    hostels = [],
    messPlans = [],
    availableRooms = [],
  } = data || {};
  const roommateOptions = [
    { value: 'quiet', label: 'Quiet' },
    { value: 'jolly', label: 'Jolly' },
    { value: 'morning-person', label: 'Morning Person' },
    { value: 'night-person', label: 'Night Person' },
    { value: 'social', label: 'Social' },
    { value: 'studious', label: 'Studious' },
    { value: 'other', label: 'Other' },
  ];

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

        {!room && availableRooms.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Select Your Room</h3>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Room #</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th>Available</th>
                    <th>Roommate Type</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {availableRooms.map((availableRoom) => (
                    <tr key={availableRoom.room_id}>
                      <td><strong>{availableRoom.room_number}</strong></td>
                      <td>{availableRoom.room_type}</td>
                      <td>{availableRoom.capacity}</td>
                      <td>{availableRoom.capacity - availableRoom.occupied}</td>
                      <td>
                        <span className="badge badge-other">
                          {availableRoom.roommate_type.replace('-', ' ')}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-small"
                          onClick={() => handleRoomSelection(availableRoom.room_id)}
                          disabled={selectingRoom}
                        >
                          {selectingRoom ? 'Selecting...' : 'Select Room'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
              <p><strong>Note:</strong> Rooms are filtered based on your roommate type preference ({resident?.roommate_type?.replace('-', ' ') || 'quiet'}).</p>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Update Profile</h3>
          </div>
          {profileForm ? (
            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  className="form-select"
                  name="gender"
                  value={profileForm.gender}
                  onChange={handleProfileChange}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Contact Number</label>
                <input
                  className="form-input"
                  name="contact_number"
                  value={profileForm.contact_number}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Emergency Contact</label>
                <input
                  className="form-input"
                  name="emergency_contact"
                  value={profileForm.emergency_contact}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Hostel</label>
                <select
                  className="form-select"
                  name="hostel_id"
                  value={profileForm.hostel_id}
                  onChange={handleProfileChange}
                >
                  <option value="">Select hostel</option>
                  {hostels.map((hostel) => (
                    <option key={hostel.hostel_id} value={hostel.hostel_id}>
                      {hostel.hostel_name} ({hostel.location})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Mess Plan</label>
                <select
                  className="form-select"
                  name="mess_plan_id"
                  value={profileForm.mess_plan_id}
                  onChange={handleProfileChange}
                >
                  <option value="">Select plan</option>
                  {messPlans.map((plan) => (
                    <option key={plan.plan_id} value={plan.plan_id}>
                      {plan.plan_type} (₹{plan.cost})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Roommate Type</label>
                <select
                  className="form-select"
                  name="roommate_type"
                  value={profileForm.roommate_type}
                  onChange={handleProfileChange}
                >
                  {roommateOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <p className="muted">Loading profile...</p>
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

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Available Hostels</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Fees</th>
              </tr>
            </thead>
            <tbody>
              {hostels.map((hostel) => (
                <tr key={hostel.hostel_id}>
                  <td>{hostel.hostel_name}</td>
                  <td>{hostel.location}</td>
                  <td>
                    ₹{hostel.hostel_fees || 0}
                    {hostel.annual_fees ? ` • Annual ₹${hostel.annual_fees}` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResidentPortal;


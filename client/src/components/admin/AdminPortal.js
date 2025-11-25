import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api';

const AdminPortal = ({ user, onLogout }) => {
  const [residents, setResidents] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [messPlans, setMessPlans] = useState([]);
  const [bills, setBills] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newResident, setNewResident] = useState({
    name: '',
    gender: 'male',
    contact_number: '',
    hostel_id: '',
    mess_plan_id: '',
  });

  const [newBill, setNewBill] = useState({
    resident_id: '',
    monthly_rent: '',
    additional_charges: '',
    due_date: '',
  });

  const [newPlan, setNewPlan] = useState({
    plan_type: 'veg',
    cost: '',
    description: '',
  });

  const [newHostel, setNewHostel] = useState({
    hostel_name: '',
    location: '',
    hostel_fees: '',
    annual_fees: '',
    security_deposit: '',
    contact_number: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        residentsRes,
        hostelsRes,
        roomsRes,
        messPlansRes,
        billsRes,
        maintenanceRes,
      ] = await Promise.all([
        adminAPI.residents.getAll(),
        adminAPI.hostels.getAll(),
        adminAPI.rooms.getAll(),
        adminAPI.messPlans.getAll(),
        adminAPI.bills.getAll(),
        adminAPI.maintenance.getAll(),
      ]);

      setResidents(residentsRes.data);
      setHostels(hostelsRes.data);
      setRooms(roomsRes.data);
      setMessPlans(messPlansRes.data);
      setBills(billsRes.data);
      setMaintenance(maintenanceRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResidentSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.residents.create(newResident);
      setNewResident({
        name: '',
        gender: 'male',
        contact_number: '',
        hostel_id: '',
        mess_plan_id: '',
      });
      setSuccess('Resident added successfully!');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add resident');
    }
  };

  const handleBillSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.bills.create(newBill);
      setNewBill({
        resident_id: '',
        monthly_rent: '',
        additional_charges: '',
        due_date: '',
      });
      setSuccess('Bill added successfully!');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add bill');
    }
  };

  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.messPlans.create(newPlan);
      setNewPlan({ plan_type: 'veg', cost: '', description: '' });
      setSuccess('Mess plan created!');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create mess plan');
    }
  };

  const handleHostelSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.hostels.create(newHostel);
      setNewHostel({
        hostel_name: '',
        location: '',
        hostel_fees: '',
        annual_fees: '',
        security_deposit: '',
        contact_number: '',
      });
      setSuccess('Hostel added successfully!');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add hostel');
    }
  };

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h2 className="page-title">Admin Control Center</h2>
          <p className="muted">Manage residents, rooms, plans, and more</p>
        </div>
        <div>
          <p className="muted">{user?.admin?.email}</p>
          <button className="btn btn-secondary" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {success && (
        <div className="success">
          {success}
          <button className="link-btn" onClick={() => setSuccess('')}>
            ×
          </button>
        </div>
      )}

      <div className="grid summary-grid">
        <div className="stat-card">
          <p className="muted">Residents</p>
          <h3>{residents.length}</h3>
        </div>
        <div className="stat-card">
          <p className="muted">Rooms</p>
          <h3>{rooms.length}</h3>
        </div>
        <div className="stat-card">
          <p className="muted">Open Maintenance</p>
          <h3>{maintenance.filter((m) => m.complaint_status !== 'resolved').length}</h3>
        </div>
        <div className="stat-card">
          <p className="muted">Pending Bills</p>
          <h3>{bills.filter((b) => b.status !== 'paid').length}</h3>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Add Resident</h3>
          </div>
          <form onSubmit={handleResidentSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                value={newResident.name}
                onChange={(e) => setNewResident({ ...newResident, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                value={newResident.gender}
                onChange={(e) => setNewResident({ ...newResident, gender: e.target.value })}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Contact</label>
              <input
                className="form-input"
                value={newResident.contact_number}
                onChange={(e) => setNewResident({ ...newResident, contact_number: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hostel</label>
              <select
                className="form-select"
                value={newResident.hostel_id}
                onChange={(e) => setNewResident({ ...newResident, hostel_id: e.target.value })}
              >
                <option value="">Select hostel</option>
                {hostels.map((hostel) => (
                  <option key={hostel.hostel_id} value={hostel.hostel_id}>
                    {hostel.hostel_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Mess Plan</label>
              <select
                className="form-select"
                value={newResident.mess_plan_id}
                onChange={(e) => setNewResident({ ...newResident, mess_plan_id: e.target.value })}
              >
                <option value="">Select plan</option>
                {messPlans.map((plan) => (
                  <option key={plan.plan_id} value={plan.plan_id}>
                    {plan.plan_type} (₹{plan.cost})
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">
              Save Resident
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Create Bill</h3>
          </div>
          <form onSubmit={handleBillSubmit}>
            <div className="form-group">
              <label className="form-label">Resident</label>
              <select
                className="form-select"
                value={newBill.resident_id}
                onChange={(e) => setNewBill({ ...newBill, resident_id: e.target.value })}
                required
              >
                <option value="">Select resident</option>
                {residents.map((resident) => (
                  <option key={resident.resident_id} value={resident.resident_id}>
                    {resident.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Monthly Rent</label>
              <input
                type="number"
                className="form-input"
                value={newBill.monthly_rent}
                onChange={(e) => setNewBill({ ...newBill, monthly_rent: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Additional Charges</label>
              <input
                type="number"
                className="form-input"
                value={newBill.additional_charges}
                onChange={(e) => setNewBill({ ...newBill, additional_charges: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={newBill.due_date}
                onChange={(e) => setNewBill({ ...newBill, due_date: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Save Bill
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Manage Hostels</h3>
          </div>
          <form onSubmit={handleHostelSubmit}>
            <div className="form-group">
              <label className="form-label">Hostel Name</label>
              <input
                className="form-input"
                value={newHostel.hostel_name}
                onChange={(e) => setNewHostel({ ...newHostel, hostel_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                className="form-input"
                value={newHostel.location}
                onChange={(e) => setNewHostel({ ...newHostel, location: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hostel Fees</label>
              <input
                type="number"
                className="form-input"
                value={newHostel.hostel_fees}
                onChange={(e) => setNewHostel({ ...newHostel, hostel_fees: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Annual Fees</label>
              <input
                type="number"
                className="form-input"
                value={newHostel.annual_fees}
                onChange={(e) => setNewHostel({ ...newHostel, annual_fees: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Security Deposit</label>
              <input
                type="number"
                className="form-input"
                value={newHostel.security_deposit}
                onChange={(e) => setNewHostel({ ...newHostel, security_deposit: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <input
                className="form-input"
                value={newHostel.contact_number}
                onChange={(e) => setNewHostel({ ...newHostel, contact_number: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Save Hostel
            </button>
          </form>
          <div className="table-container" style={{ marginTop: '1rem' }}>
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
                    <td>₹{hostel.hostel_fees || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Mess Plans</h3>
          </div>
          <form onSubmit={handlePlanSubmit}>
            <div className="form-group">
              <label className="form-label">Plan Type</label>
              <select
                className="form-select"
                value={newPlan.plan_type}
                onChange={(e) => setNewPlan({ ...newPlan, plan_type: e.target.value })}
              >
                <option value="veg">Veg</option>
                <option value="non-veg">Non-Veg</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Cost</label>
              <input
                type="number"
                className="form-input"
                value={newPlan.cost}
                onChange={(e) => setNewPlan({ ...newPlan, cost: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                className="form-input"
                value={newPlan.description}
                onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Add Plan
            </button>
          </form>
          <ul className="simple-list">
            {messPlans.map((plan) => (
              <li key={plan.plan_id}>
                <strong>{plan.plan_type}</strong> — ₹{plan.cost}
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Maintenance Queue</h3>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Issue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {maintenance.slice(0, 5).map((item) => (
                  <tr key={item.request_id}>
                    <td>{item.resident_name}</td>
                    <td>{item.issue_description}</td>
                    <td>
                      <span className={`badge badge-${item.complaint_status}`}>
                        {item.complaint_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Residents</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Hostel</th>
                <th>Mess Plan</th>
              </tr>
            </thead>
            <tbody>
              {residents.map((resident) => (
                <tr key={resident.resident_id}>
                  <td>{resident.name}</td>
                  <td>{resident.contact_number}</td>
                  <td>{resident.hostel_name || '—'}</td>
                  <td>{resident.plan_type || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Latest Bills</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Resident</th>
                <th>Due Date</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bills.slice(0, 10).map((bill) => (
                <tr key={bill.bill_id}>
                  <td>{bill.resident_name}</td>
                  <td>{new Date(bill.due_date).toLocaleDateString()}</td>
                  <td>₹{Number(bill.monthly_rent) + Number(bill.additional_charges)}</td>
                  <td>
                    <span className={`badge badge-${bill.status}`}>{bill.status}</span>
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

export default AdminPortal;

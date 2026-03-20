/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';

// --- API CONFIG ---
const api = axios.create({ baseURL: 'http://localhost:5000' });

// --- REUSABLE COMPONENTS ---
const Button = ({ children, onClick, type = "button", className = "", variant = "primary" }) => {
  const baseStyle = "w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 shadow-sm";
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
  };
  return (
    <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ placeholder, type = "text", value, onChange, required = false, minLength, maxLength }) => (
  <input
    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 mb-4 shadow-sm"
    placeholder={placeholder}
    type={type}
    value={value}
    onChange={onChange}
    required={required}
    minLength={minLength}
    maxLength={maxLength}
  />
);

const Select = ({ value, onChange, options, className = "" }) => (
  <select
    className={`w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 shadow-sm ${className}`}
    value={value}
    onChange={onChange}
  >
    {options.map((opt, idx) => (
      <option key={idx} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

const StarRating = ({ rating, setRating, interactive = false }) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          onClick={() => interactive && setRating(star)}
          className={`w-6 h-6 ${interactive ? 'cursor-pointer transform hover:scale-110 transition-transform' : ''} ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

// --- PASSWORD UPDATE COMPONENT ---
const UpdatePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const token = localStorage.getItem('token');

  const handleUpdate = async (e) => {
    e.preventDefault();
    const passRegex = /^(?=.*[A-Z])(?=.*[!@#$&*]).{8,16}$/;
    if (!passRegex.test(newPassword)) {
      return alert("Password must be 8-16 chars, with at least 1 uppercase and 1 special character.");
    }
    try {
      await api.put('/users/password', { newPassword }, { headers: { Authorization: token } });
      alert("Password updated successfully!");
      setNewPassword('');
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update password");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
      <h3 className="text-lg font-bold mb-4 text-gray-800">Security</h3>
      <form onSubmit={handleUpdate} className="flex gap-4 items-start">
        <div className="flex-1">
            <Input type="password" placeholder="New Password (8-16 chars, 1 Upper, 1 Special)" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
        </div>
        <div className="w-48">
            <Button type="submit">Update Password</Button>
        </div>
      </form>
    </div>
  );
};

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    const passRegex = /^(?=.*[A-Z])(?=.*[!@#$&*]).{8,16}$/;
    if (!passRegex.test(newPassword)) {
      return alert("Password must be 8-16 chars, with at least 1 uppercase and 1 special character.");
    }
    try {
      await api.put('/auth/forgot-password', { email, newPassword });
      alert("Password reset successfully! You can now log in.");
      setEmail('');
      setNewPassword('');
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-3xl font-bold text-center mb-2 text-indigo-700">Reset Password</h2>
        <p className="text-center text-gray-500 mb-8">Enter your email and a new password</p>
        <form onSubmit={handleReset}>
          <Input type="email" placeholder="Registered Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input type="password" placeholder="New Password (8-16 chars, 1 Upper, 1 Special)" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          <Button type="submit" className="mt-2">Reset Password</Button>
          <div className="mt-6 text-center">
            <Link to="/login" className="text-gray-500 hover:text-indigo-600 transition">← Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- PAGES ---

const Login = ({ setAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      setAuth(res.data.role);
    } catch (err) {
      alert('Login failed. Check credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-3xl font-bold text-center mb-2 text-indigo-700">Welcome Back</h2>
        <p className="text-center text-gray-500 mb-8">Sign in to your account</p>
        <form onSubmit={handleLogin}>
          <Input placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <Button type="submit" className="mt-2">Sign In</Button>
          <div className="mt-6 flex flex-col items-center gap-2">
            <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold">Forgot Password?</Link>
            <div>
              <span className="text-gray-500 text-sm">Don't have an account? </span>
              <Link to="/signup" className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold underline">Sign up</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const Signup = ({ setAuth }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', role: 'user' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if(form.name.length < 4 || form.name.length > 60) return alert("Name must be between 4 and 60 characters.");
    if(form.address.length > 400) return alert("Address must be under 400 characters.");
    
    const passRegex = /^(?=.*[A-Z])(?=.*[!@#$&*]).{2,16}$/;
    if(!passRegex.test(form.password)) return alert("Password must be 2-16 chars, with at least 1 uppercase and 1 special character.");

    try {
      // 1. Register User
      await api.post('/auth/signup', form);
      
      // 2. Auto-Login
      const res = await api.post('/auth/login', { email: form.email, password: form.password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      setAuth(res.data.role);
      
    } catch (err) {
      alert(err.response?.data?.message || 'Error registering');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-3xl font-bold text-center mb-6 text-indigo-700">Create Account</h2>
        <form onSubmit={handleSubmit}>
          <Input placeholder="Full Name (4-60 chars)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required minLength={4} maxLength={60} />
          <Input type="email" placeholder="Email Address" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <Input type="password" placeholder="Password (Upper, Special, 2-16 chars)" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          <Input placeholder="Address (Max 400 chars)" value={form.address} onChange={e => setForm({...form, address: e.target.value})} required maxLength={400} />
          
          <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
          <Select 
            value={form.role} 
            onChange={e => setForm({...form, role: e.target.value})}
            options={[{label: 'Normal User', value: 'user'}, {label: 'Store Owner', value: 'owner'}]}
          />

          <Button type="submit" className="mt-4">Register & Login</Button>
          <div className="mt-6 text-center">
            <Link to="/login" className="text-gray-500 hover:text-indigo-600 transition">← Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, stores: 0, ratings: 0 });
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Forms
  const [newStore, setNewStore] = useState({ name: '', email: '', address: '', owner_email: '' });
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', address: '', role: 'admin' });
  
  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      const sRes = await api.get('/dashboard/stats', { headers: { Authorization: token } });
      setStats(sRes.data);
      const stRes = await api.get('/admin/stores', { headers: { Authorization: token } });
      setStores(stRes.data);
      const uRes = await api.get('/admin/users', { headers: { Authorization: token } });
      setUsers(uRes.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, []);

  const addStore = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/stores', newStore, { headers: { Authorization: token } });
      setNewStore({ name: '', email: '', address: '', owner_email: '' });
      fetchData();
      alert("Store added successfully");
    } catch(err) { alert(err.response?.data?.message || "Error adding store"); }
  };

  const addUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', newUser, { headers: { Authorization: token } });
      setNewUser({ name: '', email: '', password: '', address: '', role: 'admin' });
      fetchData();
      alert("User added successfully");
    } catch(err) { alert(err.response?.data?.message || "Error adding user"); }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // Sort and Filter Users
  const filteredUsers = useMemo(() => {
    let filterable = users.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return filterable.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, searchQuery, sortConfig]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-500">
          <h3 className="text-gray-500 text-sm uppercase font-bold">Total Users</h3>
          <p className="text-4xl font-black text-gray-800 mt-2">{stats.users}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm uppercase font-bold">Total Stores</h3>
          <p className="text-4xl font-black text-gray-800 mt-2">{stats.stores}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-pink-500">
          <h3 className="text-gray-500 text-sm uppercase font-bold">Total Ratings</h3>
          <p className="text-4xl font-black text-gray-800 mt-2">{stats.ratings}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Add Store Form */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Add New Store</h3>
            <form onSubmit={addStore}>
                <Input placeholder="Store Name" value={newStore.name} onChange={e => setNewStore({...newStore, name: e.target.value})} required/>
                <Input type="email" placeholder="Store Email" value={newStore.email} onChange={e => setNewStore({...newStore, email: e.target.value})} required/>
                <Input placeholder="Store Address" value={newStore.address} onChange={e => setNewStore({...newStore, address: e.target.value})} required/>
                <Input type="email" placeholder="Owner's Email Account" value={newStore.owner_email} onChange={e => setNewStore({...newStore, owner_email: e.target.value})} required/>
                <Button type="submit">Create Store</Button>
            </form>
        </div>

        {/* Add User/Admin Form */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Add Internal User</h3>
            <form onSubmit={addUser}>
                <Input placeholder="Full Name (Min 20 chars)" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required/>
                <Input type="email" placeholder="Email Address" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required/>
                <Input type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required/>
                <Select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} options={[{label: 'Admin', value: 'admin'}, {label: 'Normal User', value: 'user'}]} />
                <Button type="submit">Create User</Button>
            </form>
        </div>
      </div>

      {/* Unified User & Store Listings */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Platform Users & Stores</h3>
          <div className="w-72">
            <Input placeholder="Search Name, Email, or Role..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-3 cursor-pointer hover:bg-gray-100" onClick={() => requestSort('name')}>Name ↕</th>
                <th className="p-3 cursor-pointer hover:bg-gray-100" onClick={() => requestSort('email')}>Email ↕</th>
                <th className="p-3">Address</th>
                <th className="p-3 cursor-pointer hover:bg-gray-100" onClick={() => requestSort('role')}>Role ↕</th>
                <th className="p-3">Store Rating (If Owner)</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 font-semibold text-gray-800">{u.name}</td>
                  <td className="p-3 text-gray-600">{u.email}</td>
                  <td className="p-3 text-gray-500 text-sm truncate max-w-xs">{u.address}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'owner' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-indigo-600">{u.store_rating ? `★ ${Number(u.store_rating).toFixed(1)}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const OwnerDashboard = () => {
  const [storeData, setStoreData] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        const res = await api.get('/owner/dashboard', { headers: { Authorization: token } });
        setStoreData(res.data);
      } catch (err) { console.error("Error fetching owner data",err); }
    };
    fetchOwnerData();
  }, [token]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Owner Dashboard</h1>
     

      {storeData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-indigo-600 p-8 rounded-xl shadow-lg text-white text-center sticky top-24">
              <div className="text-5xl mb-4">🏪</div>
              <h2 className="text-2xl font-bold mb-2">{storeData.store.name}</h2>
              <p className="text-indigo-200 mb-6">{storeData.store.address}</p>
              <div className="bg-indigo-800/50 rounded-lg p-4">
                <p className="text-sm uppercase tracking-wider mb-1">Average Rating</p>
                <p className="text-5xl font-black text-yellow-400">
                  ★ {storeData.store.avg_rating ? Number(storeData.store.avg_rating).toFixed(1) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Recent Ratings</h3>
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              {storeData.ratings.length === 0 ? (
                <p className="p-6 text-gray-500 italic">No ratings submitted yet.</p>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-4">User Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Given Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeData.ratings.map((r, idx) => (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="p-4 font-semibold text-gray-800">{r.user_name}</td>
                        <td className="p-4 text-gray-500">{r.user_email}</td>
                        <td className="p-4 text-yellow-500 font-bold text-lg">
                           {'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded text-yellow-800 shadow-sm">
          <p className="font-bold">No Store Assigned</p>
          <p>An Admin needs to create a store and assign it to your email address before you can view statistics.</p>
        </div>
      )}
    </div>
  );
};

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('name_asc');
  const [userRatings, setUserRatings] = useState({}); // Stores local input before submit
  const token = localStorage.getItem('token');

  const fetchStores = async () => {
    try {
      const res = await api.get('/stores', { headers: { Authorization: token } });
      setStores(res.data);
    } catch(err) { console.error(err); }
  };

  useEffect(() => { fetchStores(); }, []);

  const handleRatingChange = (storeId, val) => {
    setUserRatings({ ...userRatings, [storeId]: val });
  };

  const sendRating = async (storeId) => {
    const ratingVal = userRatings[storeId];
    if(!ratingVal) return alert("Please select a rating first");
    try {
        await api.post('/ratings', { storeId, rating: ratingVal }, { headers: { Authorization: token } });
        alert("Rating Submitted Successfully!");
        fetchStores(); // Refresh to show new avg and user's saved rating
    } catch(err) { 
        alert(err.response?.data?.message || "Error submitting rating"); 
    }
  };

  // Filter and Sort Logic
  const processedStores = useMemo(() => {
    let filtered = stores.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.address.toLowerCase().includes(search.toLowerCase())
    );
    
    return filtered.sort((a, b) => {
      if(sortOrder === 'name_asc') return a.name.localeCompare(b.name);
      if(sortOrder === 'name_desc') return b.name.localeCompare(a.name);
      if(sortOrder === 'rating_desc') return (b.avg_rating || 0) - (a.avg_rating || 0);
      return 0;
    });
  }, [stores, search, sortOrder]);

  return (
    <div className="container mx-auto px-4 py-8">
      
      
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="w-full md:w-1/2">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Explore Stores</h1>
          <Input placeholder="Search by name or address..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="w-full md:w-64 pb-4">
          <label className="block text-sm font-bold text-gray-700 mb-1">Sort By</label>
          <Select 
            value={sortOrder} 
            onChange={e => setSortOrder(e.target.value)}
            options={[
              {label: 'Name (A-Z)', value: 'name_asc'}, 
              {label: 'Name (Z-A)', value: 'name_desc'},
              {label: 'Highest Rated', value: 'rating_desc'}
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedStores.map(s => (
          <div key={s.id} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition duration-300 border border-gray-100 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="bg-indigo-100 p-3 rounded-lg text-2xl">🏪</div>
                    <div className="flex items-center space-x-1 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full shadow-sm">
                        <span className="text-yellow-500">★</span>
                        <span className="font-bold text-gray-800">{s.avg_rating ? Number(s.avg_rating).toFixed(1) : 'New'}</span>
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{s.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{s.address}</p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
                {/* PDF Requirment: Show their previously submitted rating if it exists */}
                {s.user_submitted_rating ? (
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-2">Your Current Rating: {s.user_submitted_rating} Star</p>
                ) : (
                  <p className="text-sm text-gray-500 mb-2">Leave a rating:</p>
                )}
                
                <div className="flex justify-between items-center">
                    <StarRating 
                        rating={userRatings[s.id] || s.user_submitted_rating || 0} 
                        setRating={(val) => handleRatingChange(s.id, val)} 
                        interactive={true} 
                    />
                    <button 
                        onClick={() => sendRating(s.id)}
                        className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-600 hover:text-white transition"
                    >
                        {s.user_submitted_rating ? 'Update' : 'Submit'}
                    </button>
                </div>
            </div>
          </div>
        ))}
        {processedStores.length === 0 && (
          <p className="col-span-full text-center text-gray-500 py-10">No stores found matching your search.</p>
        )}
      </div>
    </div>
  );
};

// --- MAIN APP SHELL ---

const App = () => {
  const [role, setRole] = useState(localStorage.getItem('role'));

  const logout = () => {
    localStorage.clear();
    setRole(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-200">
        <nav className="bg-white sticky top-0 z-50 border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg shadow-inner"></div>
                <span className="text-xl font-black tracking-tight text-gray-900">Rate<span className="text-indigo-600">Sphere</span></span>
            </div>
            {role && (
              <div className="flex items-center gap-4">
                <span className="hidden md:inline text-sm text-gray-500">Logged in as <span className="text-indigo-600 font-bold uppercase tracking-wider">{role}</span></span>
                <button onClick={logout} className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg transition text-sm font-bold border border-red-200 shadow-sm">
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>

        <Routes>
          <Route path="/login" element={!role ? <Login setAuth={setRole} /> : <Navigate to="/" />} />
          <Route path="/signup" element={!role ? <Signup setAuth={setRole} /> : <Navigate to="/" />} />
          <Route path="/forgot-password" element={!role ? <ForgotPassword /> : <Navigate to="/" />} /> 
          <Route path="/" element={
            role === 'admin' ? <AdminDashboard /> : 
            role === 'owner' ? <OwnerDashboard /> :
            role === 'user' ? <UserDashboard /> : 
            <Navigate to="/login" />
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
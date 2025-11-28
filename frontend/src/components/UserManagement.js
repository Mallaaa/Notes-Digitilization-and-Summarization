import React, { useState, useEffect } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Load users from localStorage when component mounts
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(storedUsers);
  }, []);

  const clearAllUsers = () => {
    if (window.confirm('Are you sure you want to delete all users?')) {
      localStorage.setItem('users', JSON.stringify([]));
      setUsers([]);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>User Management</h2>
      <p>Total users: {users.length}</p>
      
      <button onClick={clearAllUsers} style={{
        padding: '10px 15px',
        backgroundColor: '#ff4757',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        marginBottom: '20px',
        cursor: 'pointer'
      }}>
        Clear All Users
      </button>
      
      <div>
        {users.map(user => (
          <div key={user.id} style={{
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            marginBottom: '10px',
            backgroundColor: '#f9f9f9'
          }}>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Joined:</strong> {new Date(user.joined).toLocaleString()}</p>
            <p><strong>ID:</strong> {user.id}</p>
          </div>
        ))}
      </div>
      
      {users.length === 0 && (
        <p>No users registered yet.</p>
      )}
    </div>
  );
};

export default UserManagement;
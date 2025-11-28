import React, { useState, useEffect } from 'react';
import './Notes.css';

const History = ({ user }) => {
  const [history, setHistory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    // Load user's processing history
    const allHistory = JSON.parse(localStorage.getItem('processingHistory') || '[]');
    const userHistory = allHistory.filter(item => item.userId === user.id);
    setHistory(userHistory);
  }, [user.id]);

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your history?')) {
      const allHistory = JSON.parse(localStorage.getItem('processingHistory') || '[]');
      const filteredHistory = allHistory.filter(item => item.userId !== user.id);
      localStorage.setItem('processingHistory', JSON.stringify(filteredHistory));
      setHistory([]);
    }
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>Processing History</h2>
        {history.length > 0 && (
          <button className="clear-history-btn" onClick={clearHistory}>
            Clear History
          </button>
        )}
      </div>
      
      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No processing history yet</h3>
          <p>Upload some handwritten notes to see your history here</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map(item => (
            <div 
              key={item.id} 
              className={`history-item ${selectedItem?.id === item.id ? 'selected' : ''}`}
              onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
            >
              <div className="item-header">
                <h4>{item.filename}</h4>
                <span className="item-date">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
              </div>
              
              {selectedItem?.id === item.id && (
                <div className="item-details">
                  <div className="detail-section">
                    <h5>Extracted Text:</h5>
                    <p className="extracted-text">{item.extractedText}</p>
                  </div>
                  <div className="detail-section">
                    <h5>Summary:</h5>
                    <p className="summary-text">{item.summary}</p>
                  </div>
                  <div className="item-actions">
                    <button className="action-btn">Copy Text</button>
                    <button className="action-btn">Download</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
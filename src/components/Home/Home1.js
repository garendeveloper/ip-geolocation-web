import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';

const API_BASE = 'http://localhost:8000/api';

function Home({ user, onLogout }) {
  const [geoData, setGeoData] = useState(null);
  const [searchIp, setSearchIp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState([]);

  useEffect(() => {
    fetchCurrentGeo();
    fetchHistory();
  }, []);

  const fetchCurrentGeo = async (ip = '') => {
    setLoading(true);
    setError('');
    try {
      const params = ip ? { ip } : {};
      const response = await axios.get(`${API_BASE}/geo`, { params });
      setGeoData(response.data);
      setSearchIp('');
      await fetchHistory();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch geo data');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE}/history`);
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchIp) {
      fetchCurrentGeo(searchIp);
    }
  };

  const handleClear = () => {
    fetchCurrentGeo();
  };

  const handleHistoryClick = (historyItem) => {
    setGeoData(historyItem.geo_data);
    setSearchIp(historyItem.ip_address);
  };

  const handleDeleteHistory = async () => {
    if (selectedHistory.length === 0) return;
    
    try {
      await axios.delete(`${API_BASE}/history`, { data: { ids: selectedHistory } });
      setSelectedHistory([]);
      await fetchHistory();
    } catch (error) {
      console.error('Failed to delete history:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE}/logout`);
      onLogout();
    } catch (error) {
      console.error('Logout failed:', error);
      onLogout();
    }
  };

  const toggleHistorySelection = (id) => {
    setSelectedHistory(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="home-container">
      <header className="header">
        <h1>IP Geolocation Tracker</h1>
        <div className="user-info">
          <span>Welcome, {user?.email}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="main-content">
        {/* Search Section - Full Width */}
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Enter IP address (leave empty for your current IP)"
              value={searchIp}
              onChange={(e) => setSearchIp(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'Search IP'}
            </button>
            <button type="button" onClick={handleClear}>
              Clear
            </button>
          </form>
          {error && <div className="error">{error}</div>}
        </div>

        {loading && <div className="loading">Fetching geolocation data...</div>}

        {/* IP Details Section - Left Side */}
        {geoData && !loading && (
          <div className="ip-details-section">
            <h2>IP Address Details</h2>
            <div className="geo-details">
              <div className="detail-item">
                <span className="detail-label">IP Address:</span>
                <span className="detail-value">{geoData.ip}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">City:</span>
                <span className="detail-value">{geoData.city}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Region:</span>
                <span className="detail-value">{geoData.region}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Country:</span>
                <span className="detail-value">{geoData.country}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Coordinates:</span>
                <span className="detail-value">{geoData.loc}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Timezone:</span>
                <span className="detail-value">{geoData.timezone}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">ISP:</span>
                <span className="detail-value">{geoData.org}</span>
              </div>
            </div>
          </div>
        )}

        {/* History Section - Right Side */}
        <div className="history-section">
          <div className="history-header">
            <h3>Search History</h3>
            {selectedHistory.length > 0 && (
              <button onClick={handleDeleteHistory} className="delete-btn">
                Delete Selected ({selectedHistory.length})
              </button>
            )}
          </div>
          <div className="history-list">
            {history.map((item) => (
              <div
                key={item.id}
                className={`history-item ${selectedHistory.includes(item.id) ? 'selected' : ''}`}
                onClick={() => handleHistoryClick(item)}
              >
                <input
                  type="checkbox"
                  checked={selectedHistory.includes(item.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleHistorySelection(item.id);
                  }}
                />
                <div className="history-info">
                  <strong>{item.ip_address}</strong>
                  <span>{item.geo_data.city}, {item.geo_data.country}</span>
                  <small>Searched: {new Date(item.searched_at).toLocaleString()}</small>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <p className="no-history">No search history yet. Start by searching for an IP address!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
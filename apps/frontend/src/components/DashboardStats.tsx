import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const DashboardStats = () => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard');
                if (response.data.success) {
                    setStats(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            }
        };
        fetchStats();
    }, []);

    if (!stats) return <p>Loading statistics...</p>;

    // Prepare data for Recharts
    const chartData = [
        { name: 'Pending', value: stats.pending, color: '#ffc107' },
        { name: 'Active', value: stats.active, color: '#007bff' },
        { name: 'Completed', value: stats.completed, color: '#28a745' },
        { name: 'Overdue', value: stats.overdue, color: '#dc3545' }
    ];

    return (
        <div style={{ marginBottom: '40px' }}>
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                <div style={{ padding: '20px', borderRadius: '8px', backgroundColor: '#f8f9fa', borderLeft: '4px solid #6c757d', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#6c757d' }}>Total Tasks</h4>
                    <h2 style={{ margin: 0 }}>{stats.total_assigned}</h2>
                </div>
                <div style={{ padding: '20px', borderRadius: '8px', backgroundColor: '#f8f9fa', borderLeft: '4px solid #ffc107', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#6c757d' }}>Pending</h4>
                    <h2 style={{ margin: 0 }}>{stats.pending}</h2>
                </div>
                <div style={{ padding: '20px', borderRadius: '8px', backgroundColor: '#f8f9fa', borderLeft: '4px solid #007bff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#6c757d' }}>In Progress</h4>
                    <h2 style={{ margin: 0 }}>{stats.active}</h2>
                </div>
                <div style={{ padding: '20px', borderRadius: '8px', backgroundColor: '#f8f9fa', borderLeft: '4px solid #28a745', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#6c757d' }}>Completed</h4>
                    <h2 style={{ margin: 0 }}>{stats.completed}</h2>
                </div>
            </div>

            {/* Chart */}
            <div style={{ height: '300px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Task Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                    {/* Notice below: No quotes around {chartData}, {false}, etc. */}
                    <BarChart data={chartData}>
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
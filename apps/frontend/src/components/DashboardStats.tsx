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
        <section className="stats">
            <div className="statsGrid" aria-label="Task summary">
                <article className="statCard card">
                    <div className="statLabel muted small">Total Tasks</div>
                    <div className="statValue">{stats.total_assigned}</div>
                </article>
                <article className="statCard card">
                    <div className="statLabel muted small">Pending</div>
                    <div className="statValue">{stats.pending}</div>
                </article>
                <article className="statCard card">
                    <div className="statLabel muted small">In Progress</div>
                    <div className="statValue">{stats.active}</div>
                </article>
                <article className="statCard card">
                    <div className="statLabel muted small">Completed</div>
                    <div className="statValue">{stats.completed}</div>
                </article>
            </div>

            <div className="card card--padded chartCard" aria-label="Task distribution chart">
                <div className="chartHeader">
                    <h3 className="h2">Task Distribution</h3>
                    <p className="muted small">Overview of work across statuses.</p>
                </div>
                <div className="chartBody">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </section>
    );
};
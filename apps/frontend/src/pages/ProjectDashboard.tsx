import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { DashboardStats } from '../components/DashboardStats';

export const ProjectDashboard = () => {
    const { user, logout } = useAuth();
    const [projects, setProjects] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    // Fetch projects when the component mounts
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await api.get('/projects');
                if (response.data.success) {
                    setProjects(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch projects", error);
            }
        };
        fetchProjects();
    }, []);

    const handleProjectCreated = (newProject: any) => {
        // Optimistically update the UI by adding the new project to the top of the list
        setProjects([newProject, ...projects]);
        setIsModalOpen(false);
    };

    return (
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1>Welcome, {user?.name}</h1>
                <button onClick={logout} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Logout
                </button>
            </div>
            <DashboardStats/>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Your Projects</h2>
                <button onClick={() => setIsModalOpen(true)} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    + New Project
                </button>
                </div>
            {projects.length === 0 ? (
                <p>You don't have any projects yet. Create one to get started!</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {projects.map((project) => (
                        <div 
                            key={project.id} 
                            onClick={() => navigate(`/projects/${project.id}`)}
                            style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
                        >
                            <h3 style={{ margin: '0 0 10px 0' }}>{project.name}</h3>
                            <p style={{ color: '#666', fontSize: '14px' }}>
                                {project.description || "No description provided."}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <CreateProjectModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={handleProjectCreated} 
            />
        </div>
    );
};
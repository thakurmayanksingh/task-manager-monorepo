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
        <main className="page">
            <header className="pageHeader">
                <div className="pageHeader__title">
                    <h1 className="h1">Dashboard</h1>
                    <p className="muted">Welcome back, <span className="textStrong">{user?.name}</span>.</p>
                </div>

                <div className="pageHeader__actions">
                    <button onClick={logout} className="btn btn--danger">
                        Logout
                    </button>
                </div>
            </header>

            <section className="section" aria-label="Statistics">
                <DashboardStats />
            </section>

            <section className="section" aria-label="Projects">
                <div className="sectionHeader">
                    <div>
                        <h2 className="h2">Your Projects</h2>
                        <p className="muted">Create, access, and manage your team workspaces.</p>
                    </div>

                    <div className="sectionHeader__actions">
                        <button onClick={() => setIsModalOpen(true)} className="btn btn--primary">
                            New project
                        </button>
                    </div>
                </div>

                {projects.length === 0 ? (
                    <div className="emptyState" role="status">
                        <div className="emptyState__title">No projects yet</div>
                        <div className="emptyState__body">Create a project to start planning tasks with your team.</div>
                        <div className="emptyState__actions">
                            <button onClick={() => setIsModalOpen(true)} className="btn btn--primary">
                                Create your first project
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="gridCards">
                        {projects.map((project) => (
                            <article key={project.id} className="card card--interactive">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/projects/${project.id}`)}
                                    className="cardButton"
                                    aria-label={`Open project ${project.name}`}
                                >
                                    <div className="cardTitleRow">
                                        <h3 className="h3 cardTitle">{project.name}</h3>
                                    </div>
                                    <p className="muted cardDescription">
                                        {project.description || "No description provided."}
                                    </p>
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <CreateProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleProjectCreated}
            />
        </main>
    );
};
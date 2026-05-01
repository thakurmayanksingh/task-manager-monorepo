import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { MemberInviteSection } from '../components/MemberInviteSection';
import { toast } from 'react-hot-toast';

export const ProjectDetail = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    
    const [project, setProject] = useState<any>(null);
    const [role, setRole] = useState<'Admin' | 'Member' | null>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<any>(null);
    const [isEditingProject, setIsEditingProject] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');

    const fetchData = async () => {
        try {
            const projRes = await api.get(`/projects/${projectId}`);
            if (projRes.data.success) {
                setProject(projRes.data.data.project);
                setRole(projRes.data.data.role);
                setEditName(projRes.data.data.project.name);
                setEditDesc(projRes.data.data.project.description || '');
            }
            const taskRes = await api.get(`/projects/${projectId}/tasks`);
            if (taskRes.data.success) {
                // Translate the strict database enums back to readable frontend strings
                const mappedTasks = taskRes.data.data.map((t: any) => ({
                    ...t,
                    status: t.status === 'TODO' ? 'To Do' : 
                            t.status === 'IN_PROGRESS' ? 'In Progress' : 
                            t.status === 'DONE' ? 'Done' : t.status,
                    priority: t.priority === 'HIGH' ? 'High' : 
                              t.priority === 'MEDIUM' ? 'Medium' : 'Low'
                }));
                setTasks(mappedTasks);
            }
        } catch (error) {
            toast.error("Failed to load project data");
        }
    };

    useEffect(() => { if (projectId) fetchData(); }, [projectId]);

    const handleSaveProject = async () => {
        try {
            await api.put(`/projects/${projectId}`, { name: editName, description: editDesc });
            toast.success("Project updated!");
            setIsEditingProject(false);
            fetchData();
        } catch (err) { toast.error("Failed to update project"); }
    };

    // DESTRUCTIVE ACTIONS
    const handleDeleteProject = async () => {
        if (!window.confirm("Are you sure? This will delete the project and ALL tasks forever.")) return;
        try {
            await api.delete(`/projects/${projectId}`);
            toast.success("Project deleted.");
            navigate('/');
        } catch (err) { toast.error("Failed to delete project"); }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!window.confirm("Delete this task?")) return;
        try {
            await api.delete(`/projects/${projectId}/tasks/${taskId}`);
            setTasks(tasks.filter(t => t.id !== taskId));
            toast.success("Task deleted.");
        } catch (err) { toast.error("Failed to delete task"); }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!window.confirm("Remove this member from the project?")) return;
        try {
            await api.delete(`/projects/${projectId}/members/${userId}`);
            toast.success("Member removed.");
            fetchData();
        } catch (err) { toast.error("Failed to remove member"); }
    };

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        try {
            await api.put(`/projects/${projectId}/tasks/${taskId}`, { status: newStatus });
            setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
            toast.success('Status updated!');
        } catch (error) { toast.error("Failed to update status."); }
    };

    if (!project) return <p>Loading...</p>;

    return (
        <main className="page">
            <nav className="breadcrumbBar" aria-label="Project navigation">
                <button onClick={() => navigate('/')} className="btn btn--ghost btn--sm">
                    ← Back
                </button>
            </nav>

            <header className="projectHeader card">
                <div className="projectHeader__row">
                    {isEditingProject ? (
                        <div className="projectEdit">
                            <div className="field">
                                <label className="label" htmlFor="projectName">Project name</label>
                                <input
                                    id="projectName"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="input input--lg"
                                />
                            </div>
                            <div className="field">
                                <label className="label" htmlFor="projectDesc">Description</label>
                                <textarea
                                    id="projectDesc"
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    className="textarea"
                                />
                            </div>
                            <div className="rowActions">
                                <button onClick={handleSaveProject} className="btn btn--primary">
                                    Save
                                </button>
                                <button onClick={() => setIsEditingProject(false)} className="btn btn--ghost">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="projectHeader__content">
                            <div className="projectHeader__top">
                                <div className="projectHeader__title">
                                    <h1 className="h1 h1--compact">{project.name}</h1>
                                    <span className={`badge ${role === 'Admin' ? 'badge--danger' : 'badge--neutral'}`}>
                                        {role}
                                    </span>
                                </div>

                                {role === 'Admin' && (
                                    <div className="rowActions">
                                        <button onClick={() => setIsEditingProject(true)} className="btn btn--ghost btn--sm">
                                            Edit
                                        </button>
                                        <button onClick={handleDeleteProject} className="btn btn--danger btn--sm">
                                            Delete project
                                        </button>
                                    </div>
                                )}
                            </div>

                            <p className="muted">{project.description || 'No description provided.'}</p>
                        </div>
                    )}
                </div>
            </header>

            <section className="section" aria-label="Tasks">
                <div className="sectionHeader">
                    <div>
                        <h2 className="h2">Tasks</h2>
                        <p className="muted">Track work across statuses and due dates.</p>
                    </div>

                    <div className="sectionHeader__actions">
                        {role === 'Admin' && (
                            <button
                                onClick={() => { setTaskToEdit(null); setIsModalOpen(true); }}
                                className="btn btn--primary"
                            >
                                Add task
                            </button>
                        )}
                    </div>
                </div>

                {tasks.length === 0 ? (
                    <div className="emptyState" role="status">
                        <div className="emptyState__title">No tasks yet</div>
                        <div className="emptyState__body">Create a task to start organizing this project.</div>
                    </div>
                ) : (
                    <div className="stack">
                        {tasks.map(task => (
                            <article key={task.id} className="taskCard card">
                                <div className="taskCard__content">
                                    {/* INJECTED PRIORITY BADGE HERE */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                        <h3 className="h3" style={{ margin: 0 }}>{task.title}</h3>
                                        <span style={{ 
                                            fontSize: '12px', 
                                            padding: '3px 8px', 
                                            borderRadius: '12px', 
                                            color: 'white',
                                            backgroundColor: task.priority === 'High' ? '#ef4444' : task.priority === 'Medium' ? '#f59e0b' : '#10b981' 
                                        }}>
                                            {task.priority || 'Low'}
                                        </span>
                                    </div>
                                    <p className="muted small" style={{ margin: 0 }}>
                                        Due: {new Date(task.due_date).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="taskCard__meta">
                                    {role === 'Admin' && (
                                        <div className="rowActions">
                                            <button
                                                onClick={() => { setTaskToEdit(task); setIsModalOpen(true); }}
                                                className="btn btn--ghost btn--sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="btn btn--danger btn--sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}

                                    <div className="fieldInline">
                                        <label className="label srOnly" htmlFor={`status-${task.id}`}>Status</label>
                                        <select
                                            id={`status-${task.id}`}
                                            value={task.status}
                                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                            className="select"
                                        >
                                            <option value="To Do">To Do</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Done">Done</option>
                                        </select>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section className="section" aria-label="Team members">
                <div className="sectionHeader">
                    <div>
                        <h2 className="h2">Team Members</h2>
                        <p className="muted">People with access to this project.</p>
                    </div>
                </div>

                <ul className="memberList">
                    {project.members.map((m: any) => (
                        <li key={m.user.id} className="memberRow card">
                            <div className="memberRow__identity">
                                <div className="memberRow__name">{m.user.name}</div>
                                <div className="memberRow__meta muted small">
                                    {m.user.email} · {m.role}
                                </div>
                            </div>

                            <div className="memberRow__actions">
                                {role === 'Admin' && m.role !== 'Admin' && (
                                    <button
                                        onClick={() => handleRemoveMember(m.user.id)}
                                        className="btn btn--danger btn--sm"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>

                {role === 'Admin' && (
                    <div className="card card--padded">
                        <MemberInviteSection projectId={projectId!} onMemberAdded={fetchData} />
                    </div>
                )}
            </section>

            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                projectId={projectId!}
                members={project.members}
                existingTask={taskToEdit}
                onSuccess={() => { setIsModalOpen(false); fetchData(); }}
            />
        </main>
    );
};
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
            if (taskRes.data.success) setTasks(taskRes.data.data);
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
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <button onClick={() => navigate('/')} style={{ marginBottom: '20px', padding: '5px 10px', cursor: 'pointer' }}>&larr; Back to Dashboard</button>
            
            {/* Project Header */}
            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {isEditingProject ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                            <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ padding: '8px', fontSize: '20px' }} />
                            <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} style={{ padding: '8px' }} />
                            <div>
                                <button onClick={handleSaveProject} style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', marginRight: '10px' }}>Save</button>
                                <button onClick={() => setIsEditingProject(false)} style={{ padding: '8px 15px' }}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h1 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {project.name}
                                    <span style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: role === 'Admin' ? '#dc3545' : '#6c757d', color: 'white', borderRadius: '12px' }}>{role}</span>
                                </h1>
                                {role === 'Admin' && (
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => setIsEditingProject(true)} style={{ padding: '5px 10px' }}>Edit</button>
                                        <button onClick={handleDeleteProject} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>Delete Project</button>
                                    </div>
                                )}
                            </div>
                            <p style={{ color: '#666' }}>{project.description}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Tasks Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Project Tasks</h2>
                {role === 'Admin' && <button onClick={() => { setTaskToEdit(null); setIsModalOpen(true); }} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>+ Add Task</button>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {tasks.length === 0 ? <p>No tasks yet.</p> : tasks.map(task => (
                    <div key={task.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0' }}>{task.title}</h3>
                            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Due: {new Date(task.due_date).toLocaleDateString()}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            {role === 'Admin' && (
                                <>
                                    <button onClick={() => { setTaskToEdit(task); setIsModalOpen(true); }} style={{ padding: '5px 10px' }}>Edit</button>
                                    <button onClick={() => handleDeleteTask(task.id)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>Delete</button>
                                </>
                            )}
                            <select value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value)} style={{ padding: '8px', borderRadius: '4px' }}>
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>

            {/* Team Members Section */}
            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                <h2>Team Members</h2>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {project.members.map((m: any) => (
                        <li key={m.user.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#fdfdfd', border: '1px solid #ddd', marginBottom: '10px', borderRadius: '4px' }}>
                            <span><strong>{m.user.name}</strong> ({m.user.email}) - {m.role}</span>
                            {role === 'Admin' && m.role !== 'Admin' && (
                                <button onClick={() => handleRemoveMember(m.user.id)} style={{ padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px' }}>Remove</button>
                            )}
                        </li>
                    ))}
                </ul>
                {role === 'Admin' && <MemberInviteSection projectId={projectId!} onMemberAdded={fetchData} />}
            </div>

            <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} projectId={projectId!} members={project.members} existingTask={taskToEdit} onSuccess={() => { setIsModalOpen(false); fetchData(); }} />
        </div>
    );
};
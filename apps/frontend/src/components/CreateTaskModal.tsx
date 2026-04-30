import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    members: any[]; // <--- THIS CLEARS THE PROJECTDETAIL ERROR!
    existingTask?: any;
    onSuccess: () => void;
}

export const CreateTaskModal = ({ isOpen, onClose, projectId, members, existingTask, onSuccess }: CreateTaskModalProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [assigneeId, setAssigneeId] = useState('');

    // Pre-fill data if we are editing an existing task
    useEffect(() => {
        if (existingTask) {
            setTitle(existingTask.title);
            setDescription(existingTask.description || '');
            setAssigneeId(existingTask.assignee_id || '');
            if (existingTask.due_date) {
                setDueDate(new Date(existingTask.due_date).toISOString().slice(0, 16));
            }
        } else {
            setTitle(''); setDescription(''); setDueDate(''); setAssigneeId('');
        }
    }, [existingTask, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const loadToast = toast.loading(existingTask ? 'Updating task...' : 'Creating task...');
        try {
            const payload = {
                title, description,
                due_date: new Date(dueDate).toISOString(),
                assignee_id: assigneeId === '' ? null : assigneeId 
            };

            if (existingTask) {
                await api.put(`/projects/${projectId}/tasks/${existingTask.id}`, payload);
                toast.success('Task updated!', { id: loadToast });
            } else {
                await api.post(`/projects/${projectId}/tasks`, payload);
                toast.success('Task created!', { id: loadToast });
            }
            onSuccess();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to save task', { id: loadToast });
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '400px' }}>
                <h2>{existingTask ? 'Edit Task' : 'Create New Task'}</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                    <input type="text" placeholder="Task Title" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ padding: '10px' }} />
                    <textarea placeholder="Description (Optional)" value={description} onChange={(e) => setDescription(e.target.value)} style={{ padding: '10px', minHeight: '80px' }} />
                    <input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required style={{ padding: '10px' }} />
                    
                    <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} style={{ padding: '10px' }}>
                        <option value="">-- Unassigned --</option>
                        {members.map((m: any) => (
                            <option key={m.user.id} value={m.user.id}>{m.user.name} ({m.user.email})</option>
                        ))}
                    </select>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} style={{ padding: '8px 15px', cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            {existingTask ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
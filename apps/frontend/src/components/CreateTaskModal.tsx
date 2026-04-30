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
        <div className="modalOverlay" role="presentation">
            <div className="modal card" role="dialog" aria-modal="true" aria-label={existingTask ? 'Edit task' : 'Create task'}>
                <div className="modalHeader">
                    <h2 className="h2">{existingTask ? 'Edit task' : 'Create task'}</h2>
                    <button type="button" onClick={onClose} className="btn btn--ghost btn--sm" aria-label="Close">
                        Close
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modalForm">
                    <div className="field">
                        <label className="label" htmlFor="taskTitle">Title</label>
                        <input
                            id="taskTitle"
                            type="text"
                            placeholder="e.g. Draft project brief"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="input"
                        />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="taskDesc">Description</label>
                        <textarea
                            id="taskDesc"
                            placeholder="Optional"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="textarea"
                        />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="taskDue">Due date</label>
                        <input
                            id="taskDue"
                            type="datetime-local"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            required
                            className="input"
                        />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="taskAssignee">Assignee</label>
                        <select
                            id="taskAssignee"
                            value={assigneeId}
                            onChange={(e) => setAssigneeId(e.target.value)}
                            className="select"
                        >
                            <option value="">Unassigned</option>
                            {members.map((m: any) => (
                                <option key={m.user.id} value={m.user.id}>
                                    {m.user.name} ({m.user.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="modalActions">
                        <button type="button" onClick={onClose} className="btn btn--ghost">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn--primary">
                            {existingTask ? 'Save changes' : 'Create task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
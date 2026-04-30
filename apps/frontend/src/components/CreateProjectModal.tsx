import { useState } from 'react';
import { api } from '../services/api';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newProject: any) => void;
}

export const CreateProjectModal = ({ isOpen, onClose, onSuccess }: CreateProjectModalProps) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/projects', { name, description });
            if (response.data.success) {
                onSuccess(response.data.data);
                setName('');
                setDescription('');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create project');
        }
    };

    return (
        <div className="modalOverlay" role="presentation">
            <div className="modal card" role="dialog" aria-modal="true" aria-label="Create new project">
                <div className="modalHeader">
                    <h2 className="h2">Create project</h2>
                    <button type="button" onClick={onClose} className="btn btn--ghost btn--sm" aria-label="Close">
                        Close
                    </button>
                </div>

                {error && <p className="modalError" role="alert">{error}</p>}

                <form onSubmit={handleSubmit} className="modalForm">
                    <div className="field">
                        <label className="label" htmlFor="newProjectName">Project name</label>
                        <input
                            id="newProjectName"
                            type="text"
                            placeholder="e.g. Q3 Roadmap"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="input"
                        />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="newProjectDesc">Description</label>
                        <textarea
                            id="newProjectDesc"
                            placeholder="Optional"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="textarea"
                        />
                    </div>

                    <div className="modalActions">
                        <button type="button" onClick={onClose} className="btn btn--ghost">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn--primary">
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
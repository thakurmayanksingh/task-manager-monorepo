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
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '400px' }}>
                <h2>Create New Project</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                    <input 
                        type="text" 
                        placeholder="Project Name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                        style={{ padding: '10px' }}
                    />
                    <textarea 
                        placeholder="Description (Optional)" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        style={{ padding: '10px', minHeight: '80px' }}
                    />
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} style={{ padding: '8px 15px', cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
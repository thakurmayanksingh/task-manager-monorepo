import { useState } from 'react';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';

interface MemberInviteSectionProps {
    projectId: string;
    onMemberAdded: () => void;
}

export const MemberInviteSection = ({ projectId, onMemberAdded }: MemberInviteSectionProps) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'Admin' | 'Member'>('Member');
    const [loading, setLoading] = useState(false);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const loadToast = toast.loading('Sending invitation...');

        try {
            const response = await api.post(`/projects/${projectId}/members`, { email, role });
            if (response.data.success) {
                toast.success('Member added successfully!', { id: loadToast });
                setEmail('');
                onMemberAdded(); // Refresh the list in parent
            }
        } catch (error: any) {
            const msg = error.response?.data?.error || 'Failed to invite member';
            toast.error(msg, { id: loadToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#fdfdfd', border: '1px dashed #ccc', borderRadius: '8px' }}>
            <h3>Invite Teammate</h3>
            <form onSubmit={handleInvite} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <input 
                    type="email" 
                    placeholder="User Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    style={{ flex: 1, padding: '8px' }}
                />
                <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value as 'Admin' | 'Member')}
                    style={{ padding: '8px' }}
                >
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                </select>
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ padding: '8px 15px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Add
                </button>
            </form>
            <p style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
                * User must already have an account on the platform.
            </p>
        </div>
    );
};
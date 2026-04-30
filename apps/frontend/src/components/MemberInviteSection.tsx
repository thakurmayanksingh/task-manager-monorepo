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
        <section className="inviteCard">
            <header className="inviteHeader">
                <div>
                    <h3 className="h2">Invite teammate</h3>
                    <p className="muted small">Add someone who already has an account.</p>
                </div>
            </header>

            <form onSubmit={handleInvite} className="inviteForm">
                <div className="field">
                    <label className="label" htmlFor="inviteEmail">Email</label>
                    <input
                        id="inviteEmail"
                        type="email"
                        placeholder="teammate@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="input"
                    />
                </div>

                <div className="field">
                    <label className="label" htmlFor="inviteRole">Role</label>
                    <select
                        id="inviteRole"
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'Admin' | 'Member')}
                        className="select"
                    >
                        <option value="Member">Member</option>
                        <option value="Admin">Admin</option>
                    </select>
                </div>

                <div className="inviteActions">
                    <button type="submit" disabled={loading} className="btn btn--primary">
                        {loading ? 'Adding…' : 'Add member'}
                    </button>
                </div>
            </form>
        </section>
    );
};
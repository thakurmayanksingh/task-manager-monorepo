import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Use a loading toast for better UX
        const loadingToast = toast.loading('Logging in...');
        
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.success) {
                toast.success(`Welcome back, ${response.data.data.name}!`, { id: loadingToast });
                login(response.data.data); // Update global state
                navigate('/'); // Redirect to dashboard
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Failed to login. Please try again.';
            toast.error(errorMessage, { id: loadingToast });
        }
    };

    return (
        <main className="authShell">
            <section className="authCard card" aria-label="Login">
                <header className="authHeader">
                    <h1 className="h1">Sign in</h1>
                    <p className="muted">Welcome back. Please enter your details.</p>
                </header>

                <form onSubmit={handleSubmit} className="formStack">
                    <div className="field">
                        <label className="label" htmlFor="loginEmail">Email</label>
                        <input
                            id="loginEmail"
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            className="input"
                        />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="loginPassword">Password</label>
                        <input
                            id="loginPassword"
                            type="password"
                            placeholder="Your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            className="input"
                        />
                    </div>

                    <button type="submit" className="btn btn--primary authCta">
                        Sign in
                    </button>
                </form>

                <footer className="authFooter">
                    <p className="muted small">
                        Don&apos;t have an account? <Link className="link" to="/signup">Create one</Link>
                    </p>
                </footer>
            </section>
        </main>
    );
};
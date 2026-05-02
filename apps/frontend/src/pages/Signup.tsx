import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        try {
            const response = await api.post('/auth/signup', { name, email, password });
            if (response.data.success) {
                login(response.data.data);
                navigate('/');
            }
        } catch (err: any) {
            console.error("Full Error:", err); // Logs to your browser console
            
            if (err.response) {
                // The server responded with a status outside the 2xx range
                setError(err.response.data.error || 'Server error occurred during signup.');
            } else if (err.request) {
                // The request was made but no response was received (CORS or Network down)
                setError('Network error: Could not reach the server. Check CORS or API URL.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        }
    };

    return (
        <main className="authShell">
            <section className="authCard card" aria-label="Create account">
                <header className="authHeader">
                    <h1 className="h1">Create account</h1>
                    <p className="muted">Start organizing work with your team in minutes.</p>
                </header>

                {error && <p className="modalError" role="alert">{error}</p>}

                <form onSubmit={handleSubmit} className="formStack">
                    <div className="field">
                        <label className="label" htmlFor="signupName">Full name</label>
                        <input
                            id="signupName"
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoComplete="name"
                            className="input"
                        />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="signupEmail">Email</label>
                        <input
                            id="signupEmail"
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
                        <label className="label" htmlFor="signupPassword">Password</label>
                        <input
                            id="signupPassword"
                            type="password"
                            placeholder="At least 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                            className="input"
                        />
                    </div>

                    <button type="submit" className="btn btn--primary authCta">
                        Create account
                    </button>
                </form>

                <footer className="authFooter">
                    <p className="muted small">
                        Already have an account? <Link className="link" to="/login">Sign in</Link>
                    </p>
                </footer>
            </section>
        </main>
    );
};
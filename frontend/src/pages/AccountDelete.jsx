import { useState } from 'react';
import configWeb from "../config.js/configWeb";
import MetaHelmet from "../components/Helmet/MetaHelmet";

export default function AccountDeletePage() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [token, setToken] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('');

    const login = async () => {
        try {
            const res = await fetch(`${configWeb.BASE_URL}user/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', "x-api-key": process.env.REACT_APP_API_KEY, },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) throw new Error('Invalid login');
            const data = await res.json();
            setToken(data.access_token); // Assume JWT or similar
            setLoggedIn(true);
            setStatus('');
        } catch (err) {
            setStatus('Login failed. Please check your credentials.');
        }
    };

    const deleteAccount = async () => {
        try {
            const res = await fetch(`${configWeb.BASE_URL}user/delete`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ email })
            });
            if (!res.ok) throw new Error('Deletion failed');
            setStatus('Your account has been successfully deleted.');
        } catch (err) {
            setStatus('Failed to delete account.');
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6">
            <MetaHelmet title="Delete Account" description="" noindex={true} />
            <h1 className="text-2xl font-bold mb-4">Delete Your Route Facile Account</h1>
            {!loggedIn ? (
                <>
                    <p className="mb-4">To delete your account, please log in with your email and password.</p>
                    <input
                        type="email"
                        placeholder="Email"
                        className="border p-2 mb-2 w-full"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="border p-2 mb-2 w-full"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button onClick={login} className="findBtn btn btn-primary rounded">
                        Log In
                    </button>
                </>
            ) : (
                <>
                    <p className="mb-4">Logged in as: {email}</p>
                    <button onClick={deleteAccount} className="findBtn btn btn-primary rounded">
                        Delete My Account
                    </button>
                </>
            )}
            {status && <p className="mt-4 text-sm text-gray-700">{status}</p>}
        </div>
    );
}

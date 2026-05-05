import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleForgotPassword = async () => {
        const { value: email } = await Swal.fire({
            title: 'Forgot Password',
            input: 'email',
            inputLabel: 'Enter your registered email address',
            inputPlaceholder: 'email@example.com',
            showCancelButton: true,
            confirmButtonColor: '#A3C93A',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Submit Request',
            inputValidator: (value) => {
                if (!value) {
                    return 'Please enter your email!';
                }
            }
        });

        if (email) {
            try {
                Swal.fire({
                    title: 'Processing...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                const response = await fetch('http://127.0.0.1:8000/api/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Request Submitted',
                        text: data.message || 'The admin will process your request and send you a new password via email.',
                        confirmButtonColor: '#A3C93A'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Request Failed',
                        text: data.message || 'Something went wrong. Please check your email.',
                        confirmButtonColor: '#A3C93A'
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to connect to server.',
                    confirmButtonColor: '#A3C93A'
                });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Our AuthContext login function expects email and password as separate arguments
            const result = await login(email, password);

            if (result && result.success) {
                const userRole = result.user?.role;
                const userName = result.user?.name || 'User';

                Swal.fire({
                    icon: 'success',
                    title: 'Welcome Back!',
                    text: `Hello ${userName}, you have successfully logged in.`,
                    timer: 2000,
                    showConfirmButton: false,
                    position: 'top-end',
                    toast: true
                });

                if (['admin', 'staff', 'pharmacist', 'superadmin'].includes(userRole)) {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            } else {
                setError(result?.error || 'Failed to login. Please check your credentials.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-light-grey">
                <div>
                    <h2 className="mt-2 text-center text-3xl font-extrabold text-primary-green">
                        Vital Care
                    </h2>
                    <h3 className="mt-6 text-center text-2xl font-bold text-text-dark">
                        Sign in to your account
                    </h3>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center border border-red-200">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-dark mb-1">Email address</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-green focus:border-primary-green focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-text-dark">Password</label>
                                <button 
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-xs font-medium text-primary-green hover:text-accent-green hover:underline focus:outline-none"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-green focus:border-primary-green focus:z-10 sm:text-sm pr-10"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                {password.length > 0 && (
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none z-20"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading ? 'bg-accent-green cursor-not-allowed' : 'bg-primary-green hover:bg-accent-green'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green transition-colors`}
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm text-text-muted">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-primary-green hover:text-accent-green">
                            Register now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

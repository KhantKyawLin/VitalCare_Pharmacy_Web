import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        address: '',
        gender: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.password_confirmation) {
            setError("Passwords do not match");
            return;
        }

        if (!formData.gender) {
            setError("Please select your gender");
            return;
        }

        setIsLoading(true);

        try {
            // Send as plain object since register handles JSON in AuthContext
            const result = await register(formData);

            if (result && result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Account Created!',
                    text: `Welcome to Vital Care, ${formData.name}! Your account has been successfully created.`,
                    timer: 3000,
                    showConfirmButton: false,
                    position: 'top-end',
                    toast: true
                });
                navigate('/');
            } else {
                setError(result?.error || 'Registration failed. Please check your inputs.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-light-grey">
                <div>
                    <h2 className="mt-2 text-center text-3xl font-extrabold text-primary-green">
                        Vital Care
                    </h2>
                    <h3 className="mt-6 text-center text-2xl font-bold text-text-dark">
                        Create an account
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
                            <label className="block text-sm font-medium text-text-dark mb-1">Full Name *</label>
                            <input
                                name="name"
                                type="text"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-green focus:border-primary-green sm:text-sm"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-dark mb-1">Email address *</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-green focus:border-primary-green sm:text-sm"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-dark mb-1">Gender *</label>
                            <div className="flex gap-4 p-2 border border-gray-300 rounded-md">
                                <label className="flex items-center text-sm text-text-dark gap-1 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="male"
                                        checked={formData.gender === 'male'}
                                        onChange={handleChange}
                                        className="text-primary-green focus:ring-primary-green"
                                    />
                                    Male
                                </label>
                                <label className="flex items-center text-sm text-text-dark gap-1 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="female"
                                        checked={formData.gender === 'female'}
                                        onChange={handleChange}
                                        className="text-primary-green focus:ring-primary-green"
                                    />
                                    Female
                                </label>
                                <label className="flex items-center text-sm text-text-dark gap-1 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="others"
                                        checked={formData.gender === 'others'}
                                        onChange={handleChange}
                                        className="text-primary-green focus:ring-primary-green"
                                    />
                                    Others
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-dark mb-1">Phone Number *</label>
                            <input
                                name="phone"
                                type="text"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-green focus:border-primary-green sm:text-sm"
                                placeholder="Phone number"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-dark mb-1">Address *</label>
                            <textarea
                                name="address"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-green focus:border-primary-green sm:text-sm"
                                placeholder="Delivery address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-dark mb-1">Password *</label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-green focus:border-primary-green sm:text-sm pr-10"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-dark mb-1">Confirm Password *</label>
                            <div className="relative">
                                <input
                                    name="password_confirmation"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-green focus:border-primary-green sm:text-sm pr-10"
                                    placeholder="Confirm Password"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
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
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm text-text-muted">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary-green hover:text-accent-green">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;

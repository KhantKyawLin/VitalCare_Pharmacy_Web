import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { KeyRound, ShieldAlert, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

const ForcePasswordChangeModal = () => {
    const { user, setUser } = useContext(AuthContext);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // If no user or doesn't need to change password, render nothing
    if (!user || !user.must_change_password) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await axios.post('http://127.0.0.1:8000/api/auth/force-change-password', {
                password: password,
                password_confirmation: confirmPassword
            });

            Swal.fire({
                icon: 'success',
                title: 'Password Updated!',
                text: 'Your password has been successfully secured.',
                confirmButtonColor: 'var(--primary-color)'
            });

            // Update user state to remove modal
            setUser({ ...user, must_change_password: 0 });

        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.password?.[0] || 'Failed to update password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
                
                {/* Header Pattern */}
                <div className="bg-amber-500 p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:20px_20px]"></div>
                    <div className="relative z-10 flex justify-center mb-4">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                            <ShieldAlert size={32} className="text-amber-500" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-black text-white relative z-10 tracking-tight">Security Action Required</h2>
                </div>

                <div className="p-8">
                    <p className="text-slate-600 text-sm text-center mb-6 leading-relaxed">
                        Your password was recently reset by an administrator. For your security, you must create a new, private password before accessing your account.
                    </p>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-medium flex items-start gap-2">
                            <div className="mt-0.5"><ShieldAlert size={16} /></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                            <div className="relative">
                                <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all font-medium text-slate-800"
                                    placeholder="Enter new password"
                                />
                                {password.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none z-20"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
                            <div className="relative">
                                <CheckCircle2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all font-medium text-slate-800"
                                    placeholder="Confirm new password"
                                />
                                {confirmPassword.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none z-20"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !password || !confirmPassword}
                            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex justify-center items-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>Secure My Account</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForcePasswordChangeModal;

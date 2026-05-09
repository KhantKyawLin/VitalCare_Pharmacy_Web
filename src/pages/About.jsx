import React from 'react';
import { 
    Award, 
    ShieldCheck, 
    Truck, 
    Lightbulb,
    Target,
    Heart,
    ArrowRight,
    Star,
    Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const About = () => {
    const { settings } = useSettings();
    const primaryColor = settings?.primary_color || '#8DB600';
    const accentColor = settings?.accent_color || '#7fa400';

    // Dynamic Content from Settings with Fallbacks
    const aboutTitle = settings?.about_title || 'Your Health, Our Commitment.';
    const aboutDesc = settings?.about_description || 'Providing expert care, high-quality medications, and personalized health guidance for over 15 years.';
    const missionTitle = settings?.about_mission_title || 'Our Mission';
    const missionDesc = settings?.about_mission_desc || 'Improving lives through expert advice, quality products, and accessible care.';
    const visionTitle = settings?.about_vision_title || 'Our Vision';
    const visionDesc = settings?.about_vision_desc || 'To be the most trusted healthcare partner in every household across the nation.';
    
    const heroImage = settings?.about_hero_image 
        ? `http://127.0.0.1:8000/storage/${settings.about_hero_image}`
        : "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=2070&auto=format&fit=crop";

    const storyImage = settings?.about_story_image
        ? `http://127.0.0.1:8000/storage/${settings.about_story_image}`
        : "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop";

    const pillars = [
        {
            title: 'Expert Consultation',
            desc: 'Our certified pharmacists are always available to provide professional guidance for your health needs.',
            icon: <Award size={24} />
        },
        {
            title: 'Quality Assurance',
            desc: 'We source only 100% authentic medications from world-leading pharmaceutical manufacturers.',
            icon: <ShieldCheck size={24} />
        },
        {
            title: 'Fast Delivery',
            desc: 'Getting your prescriptions and health essentials to your doorstep safely and swiftly.',
            icon: <Truck size={24} />
        },
        {
            title: 'Community Education',
            desc: 'Beyond medicine, we empower our community with health tips and expert medical advice.',
            icon: <Lightbulb size={24} />
        }
    ];

    return (
        <div className="min-h-screen bg-white overflow-hidden font-sans">
            {/* Hero Section - Light & Clean */}
            <div className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 bg-slate-50">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
                </div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="max-w-2xl animate-in fade-in slide-in-from-left-8 duration-700">
                            <div 
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm"
                            >
                                <Sparkles size={12} style={{ color: primaryColor }} />
                                Your Trusted Healthcare Partner
                            </div>
                            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
                                {aboutTitle.split(' ').map((word, i) => (
                                    <span key={i} className={i === aboutTitle.split(' ').length - 1 ? "text-primary-green" : ""}>
                                        {word}{' '}
                                    </span>
                                ))}
                            </h1>
                            <p className="text-slate-600 text-lg leading-relaxed mb-8 font-medium max-w-lg">
                                {aboutDesc}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link 
                                    to="/contact"
                                    className="px-8 py-3.5 rounded-[4px] text-white font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2"
                                    style={{ backgroundColor: primaryColor, boxShadow: `0 8px 20px -5px ${primaryColor}66` }}
                                >
                                    Get In Touch
                                    <ArrowRight size={14} />
                                </Link>
                                <Link 
                                    to="/products"
                                    className="px-8 py-3.5 rounded-[4px] bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] transition-all hover:bg-slate-50 border border-slate-200 shadow-sm"
                                >
                                    Browse Pharmacy
                                </Link>
                            </div>
                        </div>
                        
                        <div className="relative lg:h-[500px] animate-in fade-in zoom-in duration-1000">
                            <div className="absolute -inset-4 bg-primary-green/5 rounded-3xl blur-3xl"></div>
                            <div className="relative h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                                <img 
                                    src={heroImage} 
                                    alt="About Vital Care" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=2070&auto=format&fit=crop";
                                    }}
                                />
                            </div>
                            {/* Floating Badge */}
                            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 hidden md:block">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary-green/10 text-primary-green">
                                        <Award size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Certified</p>
                                        <p className="text-xs font-bold text-slate-900">Health Specialists</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pillars Section - White Background */}
            <div className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-[11px] font-black text-primary-green uppercase tracking-[0.3em] mb-4">Values & Expertise</h2>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Why Our Patients Trust Us</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {pillars.map((pillar, idx) => (
                            <div 
                                key={idx} 
                                className="group p-8 rounded-xl border border-slate-100 transition-all duration-300 hover:border-primary-green/30 hover:bg-slate-50/50"
                            >
                                <div 
                                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 transition-all group-hover:scale-110"
                                    style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
                                >
                                    {pillar.icon}
                                </div>
                                <h4 className="text-sm font-black text-slate-900 mb-3 uppercase tracking-tight">{pillar.title}</h4>
                                <p className="text-slate-500 text-xs leading-relaxed font-medium">
                                    {pillar.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Our Story Section - Clean Split */}
            <div className="py-24 bg-slate-50/30 border-y border-slate-100">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1 relative">
                            <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-xl border-8 border-white">
                                <img 
                                    src={storyImage} 
                                    alt="Our Story" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop";
                                    }}
                                />
                            </div>
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100">
                                <div className="text-center">
                                    <span className="block text-xl font-black text-slate-900">15+</span>
                                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Years</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="order-1 lg:order-2 space-y-8">
                            <div>
                                <h2 className="text-[11px] font-black text-primary-green uppercase tracking-[0.3em] mb-4">Our Heritage</h2>
                                <h3 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                                    Building a Legacy of Health and Community Care
                                </h3>
                            </div>
                            <div className="space-y-6 text-slate-600 font-medium leading-relaxed text-sm">
                                <p>
                                    At Vital Care Pharmacy, we believe that true healthcare goes beyond the counter. It's about listening to your needs, providing reliable advice, and ensuring every patient feels valued and supported.
                                </p>
                                
                                <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3 p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
                                            <Heart size={20} />
                                        </div>
                                        <h5 className="font-black text-slate-900 text-xs uppercase tracking-widest">{visionTitle}</h5>
                                        <p className="text-[11px] text-slate-500 leading-relaxed">{visionDesc}</p>
                                    </div>
                                    <div className="space-y-3 p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600">
                                            <Target size={20} />
                                        </div>
                                        <h5 className="font-black text-slate-900 text-xs uppercase tracking-widest">{missionTitle}</h5>
                                        <p className="text-[11px] text-slate-500 leading-relaxed">{missionDesc}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA - Professional & Inviting */}
            <div className="py-24 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-900 text-white mb-4">
                            <Star size={32} />
                        </div>
                        <h3 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                            Experience the Next Level of <br />Pharmaceutical Care.
                        </h3>
                        <p className="text-slate-500 font-medium max-w-xl mx-auto">
                            Join thousands of happy customers who trust Vital Care for their health and wellness needs. We're here for you, 24/7.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 pt-4">
                            <Link 
                                to="/contact"
                                className="px-10 py-4 rounded-[4px] text-white font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Contact Us Today
                            </Link>
                            <Link 
                                to="/register"
                                className="px-10 py-4 rounded-[4px] bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] transition-all hover:bg-slate-800"
                            >
                                Join Our Community
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;

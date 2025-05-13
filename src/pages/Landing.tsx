import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-wealthmap-primary to-wealthmap-secondary">
            <div className="container mx-auto px-4 py-16">
                <div className="text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Welcome to WealthMap
                    </h1>
                    <p className="text-xl text-white/90 mb-8">
                        Your comprehensive solution for wealth management and financial planning
                    </p>
                    <div className="space-x-4">
                        <Link
                            to="/login"
                            className="inline-block bg-white text-wealthmap-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Get Started
                        </Link>
                        <Link
                            to="/company/register"
                            className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                        >
                            Register Company
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing; 
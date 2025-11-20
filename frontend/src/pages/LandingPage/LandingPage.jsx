import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import Navbar from '../../components/Navbar/Navbar';

const LandingPage = () => {
    return(
        <>
            <Navbar />
            <div className="landing-page">
                <img src="/hero.svg" alt="Company Logo" />
            </div>
        </>
    );
};

export default LandingPage;
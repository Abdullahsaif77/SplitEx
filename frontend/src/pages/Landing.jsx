import React from "react";
import styles from "../styles/landing.module.css"; 
import "bootstrap/dist/css/bootstrap.min.css";
import landingImg from "../assets/landingPic.png";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const handleLogin = (e)=>{
    e.preventDefault()
    navigate('/login');
  }
  const handleRegister = ()=>{
    navigate('/register')
  }
  return (
    <div className={styles.landingPage}>
    
      <nav className={`navbar navbar-expand-lg navbar-light shadow-sm ${styles.bgCream}`}>
        <div className="container">
          <a className="navbar-brand fw-bold" href="/">
            SplitEx
          </a>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" onClick={handleLogin}>
                  Login
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="btn ms-2"
                  onClick={handleRegister}
                  style={{ backgroundColor: "royalBlue", color: "#fff" }}
                >
                  Sign Up
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

     
      <section className={`${styles.bgCream} py-5`}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start">
              <h1 className="display-6 fw-bold">Smart Expense Splitter</h1>
              <p className="lead text-muted">
                Easily split expenses with friends, roommates, and colleagues.
              </p>
              <a className="btn btn-primary btn-lg me-2"  onClick={handleRegister}>
                Get Started
              </a>
              <a  className="btn btn-outline-secondary btn-lg" onClick={handleLogin}>
                Login
              </a>
            </div>

            <div className="col-md-6 text-center mt-4 mt-md-0">
              <img
                src={landingImg}
                className="img-fluid"
                alt="Landing illustration"
                style={{ maxHeight: "400px" }}
              />
            </div>
          </div>
        </div>
      </section>

     
      <div className={styles.line}></div>

      <section className={`container ${styles.bgCream} py-5`}>
        <div className="row text-center">
          <div className="col-md-4 pt-4">
            <h3>Create Groups</h3>
            <p>Organize expenses with friends, family, or colleagues.</p>
          </div>
          <div className="col-md-4 pt-4">
            <h3>Track in Real Time</h3>
            <p>Stay updated with live expense and balance syncing.</p>
          </div>
          <div className="col-md-4 pt-4">
            <h3>Settle with Stripe</h3>
            <p>Pay and get paid instantly with secure card payments.</p>
          </div>
        </div>
      </section>

      <footer className="text-dark pt-5 pb-3 mt-5 border-top">
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-3">
              <h5 className="fw-bold">SplitEx</h5>
              <p className="text-muted">
                Smart expense splitter for friends, roommates, and colleagues.
              </p>
            </div>

            <div className="col-md-2 mb-3">
              <h6 className="fw-bold">Links</h6>
              <ul className="list-unstyled">
                <li>
                  <a href="/" className="text-muted text-decoration-none">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/login" className="text-muted text-decoration-none">
                    Login
                  </a>
                </li>
                <li>
                  <a
                    href="/register"
                    className="text-muted text-decoration-none"
                  >
                    Register
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-md-3 mb-3">
              <h6 className="fw-bold">Resources</h6>
              <ul className="list-unstyled">
                <li>
                  <a href="#" className="text-muted text-decoration-none">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted text-decoration-none">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-md-3 mb-3">
              <h6 className="fw-bold">Contact</h6>
              <p className="text-muted mb-1">Email: support@spliex.com</p>
              <p className="text-muted">
                © {new Date().getFullYear()} SplitEx
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "../styles/landing.module.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    passwordHash: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  const redirectTo = location.state?.from || "/profile";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.passwordHash) {
      setError("Enter your email and password to continue.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5500/login",
        formData
      );

      if (response.status === 200) {
        const token = response.data.token;

        // Honor the "Keep me signed in" toggle
        const store = keepSignedIn ? localStorage : sessionStorage;
        const other = keepSignedIn ? sessionStorage : localStorage;
        other.removeItem("token");
        store.setItem("token", token);

        // Verify the token against /profile
        const verify = await axios.get(
          "http://localhost:5500/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (verify.status === 200) {
          navigate(redirectTo, { replace: true });
        } else {
          setError("Session could not be verified. Please try again.");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err?.response?.data?.message ||
          "Couldn't sign you in. Check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className={styles.regPage}>
      {/* Top bar */}
      <div className={styles.regTopBar}>
        <button
          type="button"
          className={styles.authBack}
          onClick={() => navigate("/")}
        >
          <span
            className={styles.arrow}
            style={{ transform: "rotate(180deg)" }}
          >
            →
          </span>
          Back
        </button>
        <span className={styles.regStep}>Sign in</span>
      </div>

      <div className={styles.regGrid}>
        {/* LEFT: form */}
        <section className={styles.regForm}>
          <h1 className={styles.regHeadline}>
            Pick up{" "}
            <span className={styles.regHeadlineAccent}>where you left off.</span>
          </h1>

          <p className={styles.regLede}>
            Sign in to view your groups, settle balances, and track who owes what.
          </p>

          <form className={styles.regFields} onSubmit={handleLogin} noValidate>
            <label className={styles.regField}>
              <span className={styles.regFieldLabel}>Email</span>
              <input
                className={styles.regInput}
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={update("email")}
              />
            </label>

            <label className={styles.regField}>
              <span className={styles.regFieldLabel}>Password</span>
              <input
                className={styles.regInput}
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={formData.passwordHash}
                onChange={update("passwordHash")}
              />
            </label>

            <div className={styles.regInlineRow}>
              <label className={styles.regCheck}>
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                />
                <span className={styles.regCheckBox} aria-hidden="true" />
                <span className={styles.regCheckText}>Keep me signed in</span>
              </label>
              <a href="#" className={styles.regFineLink}>
                Forgot password?
              </a>
            </div>

            {error && (
              <div className={styles.regError} role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={styles.regSubmit}
            >
              {loading ? "Signing in…" : "Sign in"}
              {!loading && <span className={styles.regSubmitArrow}>→</span>}
            </button>
          </form>

          <p className={styles.regFine}>
            New to SplitEx?{" "}
            <a href="/register" className={styles.regFineLink}>
              Create an account
            </a>
          </p>
        </section>

        {/* RIGHT: receipt */}
        <aside className={styles.regAside} aria-hidden="true">
          <div className={styles.regReceipt}>
            <div className={styles.regReceiptHead}>
              <span className={styles.regReceiptBrand}>SPLITEX</span>
              <span className={styles.regReceiptNo}>
                NO. {String(Date.now()).slice(-5)}
              </span>
            </div>

            <div className={styles.regReceiptRule} />

            <div className={styles.regReceiptRow}>
              <p className={styles.regReceiptLabel}>YOUR GROUPS</p>
              <p className={styles.regReceiptTotal}>
                <span>3</span>
                <small>&nbsp;active</small>
              </p>
            </div>

            <div className={styles.regReceiptRule} />

            <ul className={styles.regReceiptLines}>
              {[
                { n: "Bali Trip", v: "+120.00", paid: true },
                { n: "Apartment", v: "-45.50", paid: false },
                { n: "Dinner Club", v: "+18.00", paid: true },
              ].map((g) => (
                <li key={g.n} className={styles.regReceiptLine}>
                  <span className={styles.regReceiptName}>{g.n}</span>
                  <span className={styles.regReceiptDots} />
                  <span className={styles.regReceiptVal}>${g.v}</span>
                  <span
                    className={
                      g.paid ? styles.regReceiptPaid : styles.regReceiptDue
                    }
                  >
                    {g.paid ? "OWED" : "OWES"}
                  </span>
                </li>
              ))}
            </ul>

            <div className={styles.regReceiptRule} />

            <div className={styles.regReceiptFoot}>
              <span>WELCOME BACK</span>
              <span>· BALANCES LIVE ·</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Login;
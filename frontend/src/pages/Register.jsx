import React, { useState, useMemo } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../styles/landing.module.css";

const scorePassword = (pw) => {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};

const STRENGTH_LABELS = ["Too short", "Weak", "Okay", "Strong", "Solid"];

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const groupId = searchParams.get("groupId");
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    passwordHash: "",
    groupId: groupId || null,
    token: token || null,
  });
  const [subscribe, setSubscribe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pwScore = useMemo(() => scorePassword(formData.passwordHash), [formData.passwordHash]);
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isValidName = formData.name.trim().length >= 2;
  const isValidPw = formData.passwordHash.length >= 8;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!isValidName || !isValidEmail || !isValidPw) {
      setError("Please fill in all fields correctly.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5500/register",
        { ...formData, subscribe }
      );
      if (response.status === 201) {
        navigate("/login");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
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
        <button type="button" className={styles.authBack} onClick={() => navigate("/")}>
          <span className={styles.arrow} style={{ transform: "rotate(180deg)" }}>→</span>
          Back
        </button>
        <span className={styles.regStep}>New account</span>
      </div>

      <div className={styles.regGrid}>
        {/* LEFT: form */}
        <section className={styles.regForm}>
          <h1 className={styles.regHeadline}>
            Start your{" "}
            <span className={styles.regHeadlineAccent}>first group.</span>
          </h1>

          {groupId ? (
            <div className={styles.regStamp}>
              <span className={styles.pulseDot} />
              Invite&nbsp;<strong>{String(groupId).slice(0, 8).toUpperCase()}</strong>
            </div>
          ) : (
            <p className={styles.regLede}>
              One account. Unlimited groups. No card required.
            </p>
          )}

          <form className={styles.regFields} onSubmit={handleRegister} noValidate>
            <label className={styles.regField}>
              <span className={styles.regFieldLabel}>Full name</span>
              <input
                className={styles.regInput}
                type="text"
                autoComplete="name"
                placeholder="Alex Rivera"
                value={formData.name}
                onChange={update("name")}
              />
            </label>

            <label className={styles.regField}>
              <span className={styles.regFieldLabel}>Email</span>
              <input
                className={styles.regInput}
                type="email"
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
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={formData.passwordHash}
                onChange={update("passwordHash")}
              />
              {formData.passwordHash.length > 0 && (
                <div className={styles.regMeter} data-score={pwScore}>
                  <div className={styles.regMeterBars}>
                    {[1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className={`${styles.regMeterBar} ${
                          pwScore >= i ? styles.regMeterBarOn : ""
                        }`}
                      />
                    ))}
                  </div>
                  <span className={styles.regMeterLabel}>
                    {STRENGTH_LABELS[pwScore]}
                  </span>
                </div>
              )}
            </label>

            <label className={styles.regCheck}>
              <input
                type="checkbox"
                checked={subscribe}
                onChange={(e) => setSubscribe(e.target.checked)}
              />
              <span className={styles.regCheckBox} aria-hidden="true" />
              <span className={styles.regCheckText}>
                Send me occasional product updates
              </span>
            </label>

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
              {loading ? "Creating account…" : "Create account"}
              {!loading && <span className={styles.regSubmitArrow}>→</span>}
            </button>
          </form>

          <p className={styles.regFine}>
            Already have an account?{" "}
            <a href="/login" className={styles.regFineLink}>Sign in</a>
            <span className={styles.regFineDot}>·</span>
            <a href="#" className={styles.regFineLink}>Terms</a>
            <span className={styles.regFineDot}>·</span>
            <a href="#" className={styles.regFineLink}>Privacy</a>
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
              <p className={styles.regReceiptLabel}>TABLE OF 4 · DINNER</p>
              <p className={styles.regReceiptTotal}>
                $<span>248</span>
                <small>.00</small>
              </p>
            </div>

            <div className={styles.regReceiptRule} />

            <ul className={styles.regReceiptLines}>
              {[
                { n: "Alex", v: 62.0, p: true },
                { n: "Sam", v: 62.0, p: true },
                { n: "Jules", v: 62.0, p: false },
                { n: "Riley", v: 62.0, p: false },
              ].map((p) => (
                <li key={p.n} className={styles.regReceiptLine}>
                  <span className={styles.regReceiptName}>{p.n}</span>
                  <span className={styles.regReceiptDots} />
                  <span className={styles.regReceiptVal}>${p.v.toFixed(2)}</span>
                  <span
                    className={
                      p.p ? styles.regReceiptPaid : styles.regReceiptDue
                    }
                  >
                    {p.p ? "PAID" : "DUE"}
                  </span>
                </li>
              ))}
            </ul>

            <div className={styles.regReceiptRule} />

            <div className={styles.regReceiptFoot}>
              <span>THANK YOU</span>
              <span>· SPLIT &amp; SETTLED ·</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Register;
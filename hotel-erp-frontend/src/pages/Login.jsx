import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { storeUser } from "../services/userService";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const response = await loginUser(form);
      storeUser(response.data);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data || "Login failed");
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <span className="eyebrow">Front Desk Access</span>
        <h1>Sign in to manage today&apos;s hotel operations.</h1>
        <p>Use your registered admin or receptionist account.</p>
      </section>
      <section className="auth-card">
        <h2>Login</h2>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </label>
          <button className="primary-button full" type="submit">Login</button>
        </form>
        <p className="muted-link">No account? <Link to="/register">Register</Link></p>
      </section>
    </main>
  );
}

export default Login;

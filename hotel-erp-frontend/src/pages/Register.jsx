import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "ADMIN"
  });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data || "Registration failed");
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <span className="eyebrow">User Setup</span>
        <h1>Create an operations account for the ERP prototype.</h1>
        <p>Roles help explain access control in the presentation.</p>
      </section>
      <section className="auth-card">
        <h2>Register</h2>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={handleSubmit} className="form-grid two">
          <label>
            First Name
            <input name="firstName" value={form.firstName} onChange={handleChange} required />
          </label>
          <label>
            Last Name
            <input name="lastName" value={form.lastName} onChange={handleChange} required />
          </label>
          <label className="span-two">
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </label>
          <label>
            Role
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="RECEPTIONIST">Receptionist</option>
            </select>
          </label>
          <button className="primary-button full span-two" type="submit">Create User</button>
        </form>
        <p className="muted-link">Already registered? <Link to="/login">Login</Link></p>
      </section>
    </main>
  );
}

export default Register;

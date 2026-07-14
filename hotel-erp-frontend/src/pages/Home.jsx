import { Link } from "react-router-dom";

function Home() {
  return (
    <main className="auth-page">
      <section className="auth-visual">
        <span className="eyebrow">Hotel ERP Prototype</span>
        <h1>Integrated hotel operations from front desk to billing.</h1>
        <p>
          Manage customers, rooms, reservations, and invoices in one connected workflow.
        </p>
      </section>
      <section className="auth-card">
        <h2>Welcome</h2>
        <p>Sign in to access the operations dashboard.</p>
        <Link className="primary-button full" to="/login">
          Login
        </Link>
        <p className="login-note">
          Staff accounts are created by an administrator.
        </p>
      </section>
    </main>
  );
}

export default Home;

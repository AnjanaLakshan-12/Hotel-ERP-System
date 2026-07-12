import AppShell from "../../components/AppShell";

function UserManagement() {
  return (
    <AppShell title="User Management" subtitle="Prototype users are created from the register page.">
      <section className="panel">
        <h3>Access Control</h3>
        <p>
          This prototype stores users with ADMIN, MANAGER, and RECEPTIONIST roles. Passwords are
          encrypted in the backend using BCrypt.
        </p>
      </section>
    </AppShell>
  );
}

export default UserManagement;

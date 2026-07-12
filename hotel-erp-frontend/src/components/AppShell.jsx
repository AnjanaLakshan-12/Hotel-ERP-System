import Footer from "./Footer";
import Navbar from "./Navbar";

function AppShell({ title, subtitle, children, action }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-area">
        <header className="page-header">
          <div>
            <p className="eyebrow">Hotel Operations</p>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </header>
        {children}
        <Footer />
      </main>
    </div>
  );
}

export default AppShell;

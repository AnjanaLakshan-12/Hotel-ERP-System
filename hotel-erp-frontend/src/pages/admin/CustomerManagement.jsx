import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import { createCustomer, deleteCustomer, getCustomers, updateCustomer } from "../../services/customerService";

const emptyCustomer = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: ""
};

function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyCustomer);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const loadCustomers = async () => {
    const response = await getCustomers();
    setCustomers(response.data);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      if (editingId) {
        await updateCustomer(editingId, form);
        setMessage("Customer updated successfully");
      } else {
        await createCustomer(form);
        setMessage("Customer created successfully");
      }
      setForm(emptyCustomer);
      setEditingId(null);
      loadCustomers();
    } catch (err) {
      setMessage(err.response?.data || "Customer operation failed");
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer.id);
    setForm({
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || ""
    });
  };

  const handleDelete = async (id) => {
    await deleteCustomer(id);
    loadCustomers();
  };

  return (
    <AppShell title="Customer Management" subtitle="Maintain guest records used by reservations.">
      <section className="management-grid">
        <form className="panel form-grid two" onSubmit={handleSubmit}>
          <h3 className="span-two">{editingId ? "Update Customer" : "Add Customer"}</h3>
          {message && <div className="alert span-two">{message}</div>}
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
            Phone
            <input name="phone" value={form.phone} onChange={handleChange} required />
          </label>
          <label>
            Address
            <input name="address" value={form.address} onChange={handleChange} />
          </label>
          <button className="primary-button span-two" type="submit">{editingId ? "Save Changes" : "Add Customer"}</button>
        </form>

        <section className="panel table-panel">
          <h3>Customer Records</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.firstName} {customer.lastName}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td className="table-actions">
                    <button onClick={() => handleEdit(customer)}>Edit</button>
                    <button className="danger" onClick={() => handleDelete(customer.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </section>
    </AppShell>
  );
}

export default CustomerManagement;

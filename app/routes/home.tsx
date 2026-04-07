import { Link } from "react-router";

export default function HomePage() {
  return (
    <main style={{ maxWidth: 860, margin: "40px auto", padding: "0 16px" }}>
      <h1>Payment App Pattern</h1>
      <p>React Router v7 framework mode + CF Worker APIs + Better Auth + D1/Drizzle.</p>
      <ul>
        <li>
          <Link to="/auth">Auth page</Link>
        </li>
        <li>
          <Link to="/orders">Orders page</Link>
        </li>
      </ul>
    </main>
  );
}

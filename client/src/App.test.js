import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Login from "./pages/Login";

test("renders sign-in heading", () => {
  render(
    <ToastProvider>
      <AuthProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthProvider>
    </ToastProvider>
  );

  expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
});

import "@testing-library/jest-dom";  // ✅ ajoute les matchers (toBeInTheDocument, toHaveValue, etc.)
import { render, screen, fireEvent } from "@testing-library/react";
import Login from "../pages/Login";

test("✅ affiche le formulaire de login", () => {
  render(<Login />);
  expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
});

test("✅ permet de taper dans les champs", () => {
  render(<Login />);
  fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "admin@gmail.com" } });
  fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: "admin" } });

  expect(screen.getByLabelText(/Email/i)).toHaveValue("admin@gmail.com");
  expect(screen.getByLabelText(/Mot de passe/i)).toHaveValue("admin");
});

test("✅ envoie le formulaire", () => {
  render(<Login />);
  fireEvent.click(screen.getByText(/Se connecter/i));
  expect(screen.getByText(/Connexion en cours/i)).toBeInTheDocument();
});

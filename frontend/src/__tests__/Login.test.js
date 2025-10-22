import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../pages/Login";

// Mock pour naviguer
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock pour fetch
global.fetch = jest.fn();

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe("Login Component", () => {
  beforeEach(() => {
    fetch.mockClear();
    mockNavigate.mockClear();
  });

  test("✅ affiche le formulaire de login", () => {
    renderWithRouter(<Login onLogin={jest.fn()} />);
    
    expect(screen.getByLabelText(/Adresse email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument();
  });

  test("✅ permet de taper dans les champs", () => {
    renderWithRouter(<Login onLogin={jest.fn()} />);
    
    const emailInput = screen.getByLabelText(/Adresse email/i);
    const passwordInput = screen.getByLabelText(/Mot de passe/i);

    fireEvent.change(emailInput, { target: { value: "admin@gmail.com" } });
    fireEvent.change(passwordInput, { target: { value: "admin" } });

    expect(emailInput).toHaveValue("admin@gmail.com");
    expect(passwordInput).toHaveValue("admin");
  });

  test("✅ affiche un message d'erreur pour email invalide", () => {
    renderWithRouter(<Login onLogin={jest.fn()} />);
    
    const emailInput = screen.getByLabelText(/Adresse email/i);
    const submitButton = screen.getByRole('button', { name: /Se connecter/i });

    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/Veuillez entrer une adresse email valide/i)).toBeInTheDocument();
  });

  test("✅ envoie le formulaire avec succès", async () => {
    const mockOnLogin = jest.fn();
    
    // Mock de la réponse API réussie
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: "fake-jwt-token",
        user: {
          id: "1",
          email: "admin@gmail.com",
          role: "Admin",
          name: "Admin User"
        }
      })
    });

    renderWithRouter(<Login onLogin={mockOnLogin} />);
    
    fireEvent.change(screen.getByLabelText(/Adresse email/i), { 
      target: { value: "admin@gmail.com" } 
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), { 
      target: { value: "admin" } 
    });

    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    // Vérifier que le loading s'affiche
    await waitFor(() => {
      expect(screen.getByText(/Connexion.../i)).toBeInTheDocument();
    });

    // Vérifier l'appel API
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/users/login",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: "admin@gmail.com",
            password: "admin"
          })
        })
      );
    });
  });
});
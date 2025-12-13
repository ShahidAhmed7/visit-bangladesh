import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import SpotDetailPage from "./pages/SpotDetailPage.jsx";
import SpotsPage from "./pages/SpotsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import BlogsPage from "./pages/BlogsPage.jsx";
import BlogDetailPage from "./pages/BlogDetailPage.jsx";
import BlogCreatePage from "./pages/BlogCreatePage.jsx";
import BlogEditPage from "./pages/BlogEditPage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import EventDetailPage from "./pages/EventDetailPage.jsx";
import EventWizardPage from "./pages/EventWizardPage.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

const Placeholder = ({ title }) => (
  <div className="min-h-screen bg-white text-slate-900">
    <Navbar />
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-24 md:px-6">
      <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
      <p className="mt-2 text-slate-700">
        This page is coming soon. Build it with your preferred components and data hooks.
      </p>
    </main>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/spots" element={<SpotsPage />} />
          <Route path="/spots/:id" element={<SpotDetailPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blogs/new" element={<BlogCreatePage />} />
          <Route path="/blogs/:id" element={<BlogDetailPage />} />
          <Route path="/blogs/:id/edit" element={<BlogEditPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/new" element={<EventWizardPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/events/:id/edit" element={<EventWizardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

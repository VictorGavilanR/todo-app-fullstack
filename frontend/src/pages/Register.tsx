import { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

interface RegisterForm {
  username: string;
  password: string;
  confirmPassword: string;
}

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.post("register/", {
        username: form.username,
        password: form.password,
      });
      navigate("/login");
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.username) setError("Ese nombre de usuario ya está en uso.");
      else setError("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const appleFont = { fontFamily: "-apple-system, 'SF Pro Text', BlinkMacSystemFont, sans-serif" };

  const EyeIcon = ({ open }: { open: boolean }) =>
    open ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] px-4">
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_2px_40px_rgba(0,0,0,0.08)] px-10 py-12 flex flex-col items-center gap-8 border border-white/60">

        {/* Logo / Icon */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M9 11.5L11 13.5L15.5 9" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="3" y="5" width="18" height="15" rx="3" stroke="white" strokeWidth="1.8"/>
              <path d="M8 5V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-[22px] font-semibold tracking-tight text-gray-900" style={{ fontFamily: "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif" }}>
              Crear cuenta
            </h1>
            <p className="text-[14px] text-gray-400 mt-0.5" style={appleFont}>
              Únete y empieza a organizar tus tareas
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">

          {/* Username */}
          <input
            type="text"
            name="username"
            placeholder="Usuario"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
            required
            className="w-full h-[50px] rounded-xl bg-gray-50 border border-gray-200 px-4 text-[15px] text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white"
            style={appleFont}
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
              className="w-full h-[50px] rounded-xl bg-gray-50 border border-gray-200 px-4 pr-12 text-[15px] text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white"
              style={appleFont}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
              tabIndex={-1}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Repetir contraseña"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
              className={`w-full h-[50px] rounded-xl bg-gray-50 border px-4 pr-12 text-[15px] text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:bg-white ${
                form.confirmPassword.length > 0 && form.password !== form.confirmPassword
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : form.confirmPassword.length > 0 && form.password === form.confirmPassword
                  ? "border-green-300 focus:border-green-400 focus:ring-green-100"
                  : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
              }`}
              style={appleFont}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
              tabIndex={-1}
            >
              <EyeIcon open={showConfirm} />
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-100">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" className="shrink-0">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-[13px] text-red-500" style={appleFont}>{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[50px] rounded-xl bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white text-[15px] font-medium tracking-tight transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm mt-1 flex items-center justify-center gap-2"
            style={appleFont}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
                </svg>
                <span>Creando cuenta...</span>
              </>
            ) : (
              "Crear cuenta"
            )}
          </button>
        </form>

        {/* Link to login */}
        <p className="text-[13px] text-gray-400" style={appleFont}>
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-blue-500 hover:text-blue-600 font-medium transition-colors">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
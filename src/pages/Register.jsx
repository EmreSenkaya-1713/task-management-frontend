import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import "../Auth.css";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        try {
            await api.post("/auth/register", {
                name,
                email,
                password
            });

            setSuccess("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsun.");

            setTimeout(() => {
                navigate("/login");
            }, 1000);
        } catch (error) {
            console.error(
                "Register error:",
                error.response?.data || error
            );

            setError(
                error.response?.data?.message ||
                error.response?.data?.errors?.[0]?.message ||
                "Kayıt oluşturulurken bir hata oluştu."
            );
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                <div className="auth-header">
                    <p className="auth-label">
                        TASK MANAGEMENT
                    </p>

                    <h1>Hesap oluştur</h1>

                    <p>
                        Görevlerini yönetmeye başlamak için
                        ücretsiz bir hesap oluştur.
                    </p>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >
                    <div className="form-group">
                        <label>Ad</label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            placeholder="Adınız"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>E-posta</label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="emre@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Şifre</label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Şifrenizi oluşturun"
                            required
                        />
                    </div>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="auth-success">
                            {success}
                        </div>
                    )}

                    <button
                        className="auth-button"
                        type="submit"
                    >
                        Hesap Oluştur
                    </button>
                </form>

                <div className="auth-footer">
                    <span>Zaten hesabın var mı?</span>

                    <Link to="/login">
                        Giriş Yap
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default Register;
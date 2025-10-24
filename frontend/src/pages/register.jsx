import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterForm() {
    const navigate = useNavigate();
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erros, setErros] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErros([]);
        setLoading(true);

        try {
            const res = await fetch("/api/user/signup", {
                method: "POST",
                body: JSON.stringify({ nome, email, senha }),
                mode: "cors",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (res.status === 200) {
                // Registro bem-sucedido, redireciona para login
                alert("Cadastro realizado com sucesso! Faça login para continuar.");
                navigate("/dashboard/login");
            } else {
                let body = null;
                try {
                    body = await res.json();
                } catch {
                    // resposta não-JSON
                }
                const msgs = (body && Array.isArray(body.erros) && body.erros.length > 0)
                    ? body.erros
                    : ["Falha ao efetuar cadastro. Tente novamente."];
                setErros(msgs);
            }
        } catch (err) {
            console.error(err);
            setErros(["Erro de conexão. Verifique se o servidor está rodando."]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm"
            >
                <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
                    Criar Conta
                </h2>

                <div className="mb-4">
                    <label
                        htmlFor="nome"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Nome
                    </label>
                    <input
                        id="nome"
                        type="text"
                        placeholder="Seu nome completo"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-gray-50"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="exemplo@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-gray-50"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Senha
                    </label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-gray-50"
                        required
                        minLength={6}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full font-semibold py-2 rounded-lg transition duration-200 ${
                        loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-pink-600 hover:bg-pink-700 text-white"
                    }`}
                >
                    {loading ? "Cadastrando..." : "Criar Conta"}
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">
                    Já tem uma conta?{" "}
                    <Link to="/dashboard/login" className="text-pink-600 hover:underline">
                        Fazer login
                    </Link>
                </p>

                {erros.length > 0 && (
                    <ul className="text-center mt-3">
                        {erros.map((msg, i) => (
                            <li key={i} className="block text-sm text-red-500 mt-1">
                                {msg}
                            </li>
                        ))}
                    </ul>
                )}
            </form>
        </div>
    );
}

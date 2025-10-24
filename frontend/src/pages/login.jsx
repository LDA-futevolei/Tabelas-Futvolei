import { useState } from "react";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [senha, setPassword] = useState("");
    const [erros, setErros] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("/api/user/login", {
                method: "POST",
                body: JSON.stringify({ email, senha }),
                mode: "cors",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (res.status == 200) {
                window.location = "/dashboard";
            } else {
                let body = null;
                try {
                    body = await res.json();

                    const msgs = (body && Array.isArray(body.erros) && body.erros.length > 0)
                        ? body.erros
                        : ["Falha ao efetuar login. Tente novamente."];

                    setErros(msgs);
                } catch {
                    setErros(["JSON inválido!"]);
                }
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm"
            >
                <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
                    Login
                </h2>

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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-600"
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
                        placeholder="*****"
                        value={senha}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-600"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
                >
                    Entrar
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">
                    Não tem uma conta?{" "}
                    <a href="/dashboard/register" className="text-blue-600 hover:underline">
                        Criar conta
                    </a>
                </p>

                {erros.length > 0 &&
                    <ul className="text-center  ">
                        {erros.map((msg, i) => {
                            return (
                                <li key={i} className="block text-sm text-red-500 mt-2">{msg}</li>
                            );
                        })}
                    </ul>
                }
            </form>
        </div>
    );
}

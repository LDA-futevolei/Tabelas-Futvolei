import { useEffect, useState } from "react";

export default function Dashboard() {
    const [user, setUser] = useState(null);

    
    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/user/profile", {
                    method: "GET",
                    mode: "cors",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                const body = await res.json();

                if (res.status == 200 && body.data != null) {
                    setUser(body.data);
                } else {
                    window.location = "/dashboard/login";
                }
            } catch (err) {
                alert("Não foi possível baixar os dados do usuário: " + err.message);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <h1>Dashboard</h1>
            { user && <h2>{user.nome}</h2>}
        </div>
    );
}
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function sendMessage(message: string, token: string) {
    const res = await fetch(
        `${API_URL}/chat`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message }),
        }
    );

    if (!res.ok) {
        throw new Error(`Error sending message: ${res.statusText}`);
    }

    return res.json();
}

export async function getHistory(token: string, page: number = 1, limit: number = 10) {
    const res = await fetch(
        `${API_URL}/history?page=${page}&limit=${limit}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!res.ok) {
        throw new Error(`Error fetching history: ${res.statusText}`);
    }

    return res.json();
}

export async function saveCheckIn(data: { mood: string; energy: number; stress: number; notes: string }, token: string) {
    const res = await fetch(
        `${API_URL}/checkin`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        }
    );

    if (!res.ok) {
        throw new Error(`Error saving check-in: ${res.statusText}`);
    }

    return res.json();
}

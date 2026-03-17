const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://aicompanionbackend.up.railway.app";

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
    const url = `${API_URL}/history?page=${page}&limit=${limit}`;
    const res = await fetch(
        url,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!res.ok) {
        const errorText = await res.text().catch(() => "No error details");
        console.error(`Error fetching history [${res.status}]: ${errorText}`);
        throw new Error(`Error fetching history: ${res.status} ${res.statusText}`);
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
export async function getActivities(token: string) {
    const res = await fetch(
        `${API_URL}/activity`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!res.ok) {
        throw new Error(`Error fetching activities: ${res.statusText}`);
    }

    return res.json();
}

export async function updateActivityStatus(
    id: string, 
    status: 'completed' | 'pending' | 'cancelled', 
    token: string,
    effectivenessScore: number = 0
) {
    const res = await fetch(
        `${API_URL}/activity/${id}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status, effectivenessScore }),
        }
    );

    if (!res.ok) {
        let errorMessage = `Error updating activity status: ${res.status} ${res.statusText}`;
        try {
            const errorData = await res.json();
            errorMessage += ` - ${JSON.stringify(errorData)}`;
        } catch (e) {
            // No JSON body
        }
        throw new Error(errorMessage);
    }

    return res.json();
}

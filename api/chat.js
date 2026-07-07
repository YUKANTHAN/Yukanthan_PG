export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages } = req.body;
    const apiKey = process.env.NVIDIA_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    try {
        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages,
                model: 'meta/llama-3.1-8b-instruct',
                temperature: 1,
                top_p: 0.95,
                max_tokens: 16384,
                stream: false
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Failed to fetch from NVIDIA API');
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('NVIDIA API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}

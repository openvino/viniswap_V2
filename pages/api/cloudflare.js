const SECRET_KEY = process.env.NEXT_PUBLIC_CLOUDFLARE_SECRET_KEY;

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	const { token } = req.body;

	if (!token) {
		return res.status(400).json({ error: "Missing token" });
	}

	try {
		const secretKey = SECRET_KEY;
		const response = await fetch(
			"https://challenges.cloudflare.com/turnstile/v0/siteverify",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					secret: secretKey,
					response: token,
				}),
			}
		);

		const data = await response.json();
		console.log(data);

		if (data.success) {
			console.log("Human detected");

			return res.status(200).json({ success: true });
		} else {
			console.log("fail");

			return res.status(400).json({ error: "Validation failed", data });
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Internal server error" });
	}
}

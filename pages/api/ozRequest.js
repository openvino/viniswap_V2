const url =
	"https://api.defender.openzeppelin.com/actions/d13d2ed9-8caa-4215-a16d-068b1e6e67c9/runs/webhook/76e39a09-c42a-4cb5-972c-3615fab4ed2c/WGqRscRi946MbRu3v1T3Wr";
export default async function handler(req, res) {
	console.log("API request", req.body);
	const request = { ...req.body.request };

	const response = await fetch(url, {
		method: "POST",
		body: JSON.stringify(request),
		headers: {
			Authorization: `Bearer ${process.env.NEXT_PUBLIC_RELAYER_API_KEY}`,
			"Content-Type": "application/json",
		},
	});
	console.log("response", response);

	try {
		res.status(200).json({ status: "ok", response });
	} catch (error) {
		res.status(400).json({ status: "error", error: error.message });
	}
}

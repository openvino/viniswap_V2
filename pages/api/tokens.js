import { getTokens } from "../../db_controllers/tokens";

export default async function handler(req, res) {
  try {
    const tokens = await getTokens();
    res.status(200).json({ status: "ok", tokens: tokens.rows });
  } catch (error) {
    res.status(400).json({ status: "error", error: error.message });
  }
}

import { getNetworks } from "../../db_controllers/network";

export default async function handler(req, res) {
  try {
    const networks = await getNetworks();
    res.status(200).json({ status: "ok", networks: networks });
  } catch (error) {
    res.status(400).json({ status: "error", error: error.message });
  }
}

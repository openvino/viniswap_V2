import { currentNetwork } from "../../db_controllers";

export default async function handler(req, res) {
  try {
    const network = await currentNetwork();
    res.status(200).json({ status: "ok", network: networks.rows });
  } catch (error) {
    res.status(400).json({ status: "error", error: error.message });
  }
}

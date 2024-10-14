import { getPools } from "../../db_controllers/pools";

export default async function handler(req, res) {
  try {
    const pools = await getPools();
    res.status(200).json({ status: "ok", pools: pools.rows });
  } catch (error) {
    res.status(400).json({ status: "error", error: error.message });
  }
}

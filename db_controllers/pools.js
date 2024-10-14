import { conn } from "../config";

export const getPools = async () => {
  try {
    const network = await conn.query(
      `SELECT * FROM networks WHERE active=true LIMIT 1`
    );

    if (network.rows.length === 0) {
      console.log("No active network found");
      return null;
    }

    const networkId = network.rows[0].id;

    console.log(networkId);
    console.log(typeof networkId);

    const pools = await conn.query(`SELECT * FROM pools WHERE network_id=$1`, [
      networkId,
    ]);

    console.log(pools.rows);

    return pools;
  } catch (error) {
    console.error("Error fetching pools:", error);
    throw error;
  }
};

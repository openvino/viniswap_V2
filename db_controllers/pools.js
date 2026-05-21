import { conn } from "../config";

export const getPools = async () => {
  try {
    const network = await conn.query(
      `SELECT * FROM networks WHERE active=true LIMIT 1`
    );

    if (network.rows.length === 0) {
      return null;
    }

    const networkId = network.rows[0].id;


    const pools = await conn.query(`SELECT * FROM pools WHERE network_id=$1`, [
      networkId,
    ]);


    return pools;
  } catch (error) {
    console.error("Error fetching pools:", error);
    throw error;
  }
};

import { conn } from "../config";

export const getNetworks = async () => {
  const networks = await conn.query(`SELECT * FROM networks`);

  if (networks.rows.length) {
    return networks;
  } else {
    return null;
  }
};

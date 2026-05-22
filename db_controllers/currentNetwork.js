import { conn } from "../config";

export const currentNetwork = async () => {
  const network = await conn.query(
    `SELECT * FROM networks WHERE active=true LIMIT 1`
  );

  if (network.rows.length) {
    return network;
  } else {
    return null;
  }
};

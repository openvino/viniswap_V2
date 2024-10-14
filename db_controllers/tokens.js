import { conn } from "../config";

export const getTokens = async () => {
  const networks = await conn.query(`SELECT * FROM token_wineries`);

  if (networks.rows.length) {
    return networks;
  } else {
    return null;
  }
};

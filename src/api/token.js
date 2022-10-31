import SPOTIFY from './spotify';
import FIRESTORE from './firestore';

export const refreshToken = async (userId) => {
  const userTmp = await FIRESTORE.getDoc('profiles', userId);
  const tokenTmp = await SPOTIFY.refreshTokenSpot(userTmp);
  await FIRESTORE.recordSpotifyToken(userId, tokenTmp);
  console.log('refresh token 👀');
  return tokenTmp;
};

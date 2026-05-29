import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { auth } from "../../firebase/firebase";

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();

  const result = await signInWithPopup(
    auth,
    provider
  );

  return await result.user.getIdToken();
};

export const signInWithFacebook = async () => {
  const provider = new FacebookAuthProvider();

  const result = await signInWithPopup(
    auth,
    provider
  );

  return await result.user.getIdToken();
};

export const signInWithApple = async () => {
  const provider = new OAuthProvider(
    "apple.com"
  );

  const result = await signInWithPopup(
    auth,
    provider
  );

  return await result.user.getIdToken();
};
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, inMemoryPersistence, setPersistence, signInWithPopup, signOut } from "firebase/auth";

// Firebase web configuration identifies the project; this is not a server credential.
const app = initializeApp({
  apiKey: "AIzaSyBMavCh7Sey1i41uAYEWgrgZxQTipX4GlQ",
  authDomain: "attacktrace-private-20261016.firebaseapp.com",
  projectId: "attacktrace-private-20261016",
  appId: "1:23971457649:web:ac3e59d999698c090f49d0",
});

export async function googleIdToken(): Promise<string> {
  const auth = getAuth(app);
  await setPersistence(auth, inMemoryPersistence);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const credential = await signInWithPopup(auth, provider);
  try { return await credential.user.getIdToken(); }
  finally { await signOut(auth); } // The backend session owns access; do not retain refresh tokens.
}

import Keycloak from "keycloak-js";
import { reactive } from "vue";

let keycloak = null;

export const state = reactive({
  authenticated: false,
  userProfile: null
});

export function initKeycloak() {
  return new Promise((resolve, reject) => {
    keycloak = new Keycloak({
      url: import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8080",
      realm: "codesnap",
      clientId: "codesnap-client"
    });

    keycloak.init({
      onLoad: "check-sso",
      checkLoginIframe: false,
      silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
      pkceMethod: 'S256',
    }).then(authenticated => {
      state.authenticated = !!authenticated;

      if (authenticated) {
        keycloak.loadUserProfile().then(profile => {
          state.userProfile = profile;
        }).catch(err => {
          console.error("Failed to load user profile:", err);
        });

        startTokenRefresh();
      }

      resolve(keycloak);
    }).catch(err => {
      console.error("Keycloak init error:", err);
      reject(err);
    });
  });
}

export function getKeycloak() {
  return keycloak;
}

export function getToken() {
  return keycloak?.token;
}

export function login() {
  keycloak?.login();
}

export function register() {
  if (!keycloak) {
    console.error("Keycloak not initialized");
    return;
  }
  keycloak.register();
}

export function logout() {
  if (!keycloak) {
    console.error("Keycloak not initialized");
    return;
  }

  keycloak.logout({
    redirectUri: window.location.origin
  }).catch(err => {
    console.error("Logout failed:", err);
    state.authenticated = false;
    state.userProfile = null;
  });
}

function startTokenRefresh() {
  setInterval(() => {
    keycloak.updateToken(60)
      .then(refreshed => {
        if (refreshed) console.log("Keycloak token refreshed");
      })
      .catch(() => {
        console.warn("Failed to refresh token, logging out");
        logout();
      });
  }, 60000);
}

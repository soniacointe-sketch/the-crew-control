(function () {
  'use strict';
  const context = window.__eloahRecoveryContext;
  if (!context || !context.active) return;
  const api = 'https://voytsqyorhoveurnguxn.supabase.co/auth/v1';
  const publishableKey = 'sb_publishable_WrZkFoX6rrC3CLjasrn1VQ_lB4pr6gy';
  const founderId = 'bd4b7197-6401-4a9a-a14e-c6adbdc0ed46';
  const get = (id) => document.getElementById(id);
  const pending = get('recovery-pending');
  const formSection = get('password-recovery');
  const form = get('recovery-form');
  const message = (value) => {
    get('recovery-hint').textContent = value;
    get('state').textContent = value;
  };
  get('login').hidden = true;
  get('home').hidden = true;
  formSection.hidden = true;
  form.hidden = true;
  pending.hidden = false;
  let verifiedAccessToken = null;
  async function getVerifiedToken() {
    if (context.error) throw new Error(context.error.replace(/\+/g, ' '));
    let token = context.token;
    if (!token) {
      if (!window.supabase) throw new Error('Le service de connexion ne se charge pas sur cet appareil.');
      const recoveryClient = window.supabase.createClient(api.replace('/auth/v1', ''), publishableKey, {
        auth: { persistSession: true, autoRefreshToken: false, detectSessionInUrl: true, storageKey: 'eloah-recovery-flow-v2' }
      });
      if (context.code) {
        const { error } = await recoveryClient.auth.exchangeCodeForSession(context.code);
        if (error) throw error;
      } else {
        await recoveryClient.auth.initialize();
      }
      const { data, error } = await recoveryClient.auth.getSession();
      if (error) throw error;
      token = data.session?.access_token;
    }
    if (!token) throw new Error('Le lien ne contient pas de session valide. Demande un nouveau lien.');
    const response = await fetch(api + '/user', {
      headers: { apikey: publishableKey, Authorization: 'Bearer ' + token }, cache: 'no-store'
    });
    const user = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error('Ce lien a expiré ou a déjà été utilisé.');
    if (user.id !== founderId) throw new Error('Ce lien ne correspond pas au compte fondatrice ELOAH.');
    return token;
  }
  async function verify() {
    message('Vérification sécurisée du lien reçu par e-mail…');
    try {
      verifiedAccessToken = await getVerifiedToken();
      pending.hidden = true;
      formSection.hidden = false;
      form.hidden = false;
      get('recovery-description').textContent = 'Lien vérifié. Choisis un nouveau mot de passe de 12 caractères minimum.';
      history.replaceState(null, '', location.pathname);
      get('state').textContent = 'Lien validé. Tu peux choisir ton nouveau mot de passe.';
    } catch (error) {
      message(error?.message || 'Lien non reconnu. Demande un nouveau lien de récupération.');
    }
  }
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!verifiedAccessToken) return message('Le lien doit être validé avant de modifier ton mot de passe.');
    if (get('new-password').value !== get('confirm-password').value) return message('Les deux mots de passe doivent être identiques.');
    const button = get('save-password');
    button.disabled = true;
    get('state').textContent = 'Enregistrement du nouveau mot de passe…';
    try {
      const response = await fetch(api + '/user', {
        method: 'PUT',
        headers: {
          apikey: publishableKey,
          Authorization: 'Bearer ' + verifiedAccessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: get('new-password').value }),
        cache: 'no-store'
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.msg || result.message || result.error_description || 'Impossible de mettre à jour le mot de passe.');
      verifiedAccessToken = null;
      context.token = null;
      get('new-password').value = '';
      get('confirm-password').value = '';
      history.replaceState(null, '', location.pathname);
      formSection.hidden = true;
      pending.hidden = false;
      const link = document.createElement('a');
      link.href = 'eloah-fondatrice.html';
      link.className = 'launch';
      link.textContent = 'Se connecter avec le nouveau mot de passe →';
      pending.appendChild(link);
      message('Ton mot de passe est modifié. Tu peux maintenant ouvrir ELOAH.');
    } catch (error) {
      get('state').textContent = error?.message || 'Erreur lors de la modification du mot de passe.';
    } finally {
      button.disabled = false;
    }
  });
  verify();
}());
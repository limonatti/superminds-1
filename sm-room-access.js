/* Account-based access shared by the whiteboard and the lesson room. */
(function () {
  const URL = 'https://kdzpmbuohfjbtjpqrdfx.supabase.co';
  const KEY = 'sb_publishable_K8vhCVG_jiEyHYQOgp3XWQ_bWobdeBG';
  function gate(message, login) {
    document.getElementById('roomAccessGate')?.remove();
    const overlay = document.createElement('section');
    overlay.id = 'roomAccessGate';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'roomAccessTitle');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#fbf7ef;display:grid;place-items:center;padding:24px;color:#331f25;font:17px/1.6 system-ui';
    const card = document.createElement('div');
    card.style.cssText = 'max-width:480px';
    const title = document.createElement('h1'); title.id='roomAccessTitle';title.textContent = 'Комната урока';
    const text = document.createElement('p'); text.textContent = message;
    const link = document.createElement('a');
    link.textContent = login ? 'Войти и вернуться к уроку' : 'Попробовать снова';
    link.href = login ? 'cabinet.html?next=' + encodeURIComponent(location.pathname + location.search + location.hash) : location.href;
    link.style.cssText = 'display:inline-block;padding:12px 18px;border-radius:12px;background:#7c2340;color:#fff;text-decoration:none';
    card.append(title, text, link); overlay.append(card); document.body.append(overlay);
    [...document.body.children].forEach(el=>{if(el!==overlay)el.inert=true;});
    overlay.addEventListener('keydown',event=>{if(event.key==='Tab'){event.preventDefault();link.focus();}});
    link.focus();
  }
  function fail(error) {
    const code = error?.message || '';
    gate(code.includes('ROOM_TEACHER_REQUIRED') ? 'Создать комнату может преподаватель. Попроси у него ссылку на урок.' :
      code.includes('ROOM_ACCESS_DENIED') ? 'У этого аккаунта нет доступа к комнате. Попросите преподавателя прислать новую ссылку-приглашение.' :
      'Не удалось открыть комнату. Проверьте подключение и попробуйте снова. Сохранённая доска не изменена.');
  }
  async function open() {
    try {
      const sb = window.supabase.createClient(URL, KEY, {realtime:{params:{eventsPerSecond:60}}});
      const {data:sessionData,error:sessionError} = await sb.auth.getSession();
      if (sessionError) throw sessionError;
      const user = sessionData.session?.user;
      if (!user) { gate('Войдите в свой аккаунт, чтобы открыть доску и присоединиться к уроку.', true); return null; }
      const params = new URLSearchParams(location.search);
      const invite = new URLSearchParams(location.hash.slice(1)).get('invite');
      const {data,error} = await sb.rpc('open_lesson_room', {p_room:params.get('room'),p_invite:invite});
      if (error) throw error;
      params.set('room', data.room); params.delete('s');
      history.replaceState(null, '', location.pathname + '?' + params.toString());
      // Tokens remain in memory; sharing is an explicit action by the owner.
      const inviteUrl = (page) => {
        const url = new window.URL(page, location.href);
        url.searchParams.set('room', data.room);
        if (data.invite) url.hash = new URLSearchParams({invite:data.invite}).toString();
        return url.href;
      };
      await sb.realtime.setAuth();
      sb.auth.onAuthStateChange((event,session) => {
        if (!session || session.user.id !== user.id) location.reload();
      });
      return {sb,room:data.room,role:data.role,inviteUrl};
    } catch (error) { fail(error); return null; }
  }
  // Topic authorization, not a client-provided "from" field, proves the sender's role.
  function acceptLessonMessage(payload, sender, me, holder, liveCourse) {
    if (!payload || typeof payload !== 'object') return null;
    const p = {...payload,from:sender};
    if (sender === 't') return p;
    if (me !== 't') return null;
    if (['hello','ask','vdom'].includes(p.t)) return p;
    if (p.t === 'outcomes' && p.data?.kind === 'answers') return p;
    if (p.t === 'ctrl' && holder === 's' && p.h === 't') return p;
    if (['state','ptr','act'].includes(p.t) && holder === 's' && !liveCourse) return p;
    return null;
  }
  async function imageUrl(sb, source) {
    let path = typeof source === 'string' && source.startsWith('board-image:') ? source.slice(12) : null;
    if (!path && typeof source === 'string') {
      const prefix=URL+'/storage/v1/object/public/board-images/';
      if (source.startsWith(prefix)) path=decodeURIComponent(source.slice(prefix.length));
    }
    if (path) {
      const {data,error}=await sb.storage.from('board-images').createSignedUrl(path,3600);
      if (error) throw error;
      return data.signedUrl;
    }
    return /^(https?:\/\/|data:image\/(?:png|jpeg|webp|gif);base64,)/i.test(source||'') ? source : '';
  }
  window.SMRoom = {open,fail,acceptLessonMessage,imageUrl};
})();

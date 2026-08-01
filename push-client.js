(() => {
  'use strict';
  const N=window.NOVIQ=window.NOVIQ||{};
  const base64ToUint8Array=value=>{
    const padding='='.repeat((4-value.length%4)%4);
    const raw=atob((value+padding).replace(/-/g,'+').replace(/_/g,'/'));
    return Uint8Array.from([...raw].map(char=>char.charCodeAt(0)));
  };
  N.push={
    supported:()=>('serviceWorker' in navigator)&&('PushManager' in window)&&('Notification' in window),
    async status(){
      if(!this.supported())return {supported:false,permission:'unsupported',subscribed:false};
      const registration=await navigator.serviceWorker.ready;
      const subscription=await registration.pushManager.getSubscription();
      return {supported:true,permission:Notification.permission,subscribed:Boolean(subscription)};
    },
    async subscribe(){
      if(!this.supported())throw new Error('PUSH_UNSUPPORTED');
      if(!N.session?.accessToken)throw new Error('AUTH_REQUIRED');
      const permission=await Notification.requestPermission();
      if(permission!=='granted')throw new Error('PUSH_PERMISSION_DENIED');
      const registration=await navigator.serviceWorker.ready;
      const publicKey=window.NOVIQ_RUNTIME_CONFIG?.vapidPublicKey;
      if(!publicKey)throw new Error('VAPID_PUBLIC_KEY_MISSING');
      const existing=await registration.pushManager.getSubscription();
      const subscription=existing||await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:base64ToUint8Array(publicKey)});
      const json=subscription.toJSON();
      return N.api.request('/v1/push/subscribe',{
        method:'POST',
        body:{endpoint:json.endpoint,keys:json.keys,userAgent:navigator.userAgent}
      });
    },
    async test(){return N.api.request('/v1/push/test',{method:'POST'});}
  };
})();

export function resetPasswordTemplate(params: {
  appName: string;
  resetLink: string;
  expiresMinutes: number;
}) {
  const { appName, resetLink, expiresMinutes } = params;

  return `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto; line-height: 1.5; color:#0f172a;">
    <h2 style="margin:0 0 12px;">${appName} — Restablecer contraseña</h2>
    <p style="margin:0 0 12px;">Recibimos una solicitud para restablecer tu contraseña.</p>
    <p style="margin:0 0 16px;">
      <a href="${resetLink}"
         style="display:inline-block; background:#2563eb; color:#fff; text-decoration:none; padding:10px 14px; border-radius:10px;">
        Cambiar contraseña
      </a>
    </p>
    <p style="margin:0 0 12px; color:#334155;">
      Este enlace expira en <b>${expiresMinutes} minutos</b>.
    </p>
    <p style="margin:0; color:#64748b; font-size: 13px;">
      Si no fuiste tú, puedes ignorar este correo con seguridad.
    </p>
  </div>`;
}

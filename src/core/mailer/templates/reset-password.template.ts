export function resetPasswordTemplate(params: {
  appName: string;
  resetLink: string;
  expiresMinutes: number;
}) {
  const { appName, resetLink, expiresMinutes } = params;

  return `
  <div style="background:#f6f7fb; padding:24px 0; margin:0;">
    <div style="max-width:600px; margin:0 auto; padding:0 16px;">
      
      <!-- Header -->
      <div style="text-align:left; margin-bottom:14px;">
        <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto; font-size:14px; color:#64748b;">
          ${appName}
        </div>
      </div>

      <!-- Card -->
      <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:14px; padding:22px; box-shadow:0 8px 24px rgba(15,23,42,0.06);">
        
        <h2 style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto; margin:0 0 10px; font-size:20px; color:#0f172a;">
          Restablecer contraseña
        </h2>

        <p style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto; margin:0 0 14px; font-size:14px; color:#334155; line-height:1.6;">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta. Si fuiste tú, usa el botón de abajo para continuar.
        </p>

        <!-- CTA Button -->
        <div style="margin:18px 0 18px;">
          <a href="${resetLink}"
             style="display:inline-block; background:#2563eb; color:#ffffff; text-decoration:none; padding:12px 16px; border-radius:10px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto; font-size:14px; font-weight:600;">
            Cambiar contraseña
          </a>
        </div>

        <!-- Expiration -->
        <p style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto; margin:0 0 10px; font-size:13px; color:#475569;">
          Este enlace expira en <b style="color:#0f172a;">${expiresMinutes} minutos</b>.
        </p>

        <!-- Fallback link -->
        <div style="margin:14px 0 0; padding:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;">
          <p style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto; margin:0 0 8px; font-size:12px; color:#475569;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:
          </p>
          <p style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; margin:0; font-size:12px; color:#0f172a; word-break:break-all;">
            <a href="${resetLink}" style="color:#2563eb; text-decoration:none;">${resetLink}</a>
          </p>
        </div>

        <!-- Security note -->
        <div style="margin-top:18px; padding-top:14px; border-top:1px solid #e5e7eb;">
          <p style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto; margin:0; font-size:12px; color:#64748b; line-height:1.6;">
            Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña no se modificará a menos que confirmes desde el enlace.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align:left; margin-top:14px;">
        <p style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto; margin:0; font-size:12px; color:#94a3b8;">
          © ${new Date().getFullYear()} ${appName}. Este es un mensaje automático, por favor no respondas a este correo.
        </p>
      </div>

    </div>
  </div>`;
}

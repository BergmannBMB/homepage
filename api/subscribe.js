// ─────────────────────────────────────────────────────────────────────────────
// /api/subscribe.js  —  Vercel Serverless Function
// BMB Deutschland GmbH · Brevo · PDF-Anhang + Lead-Speicherung
// ─────────────────────────────────────────────────────────────────────────────

// PDF als base64 — liegt als api/pdf_b64.js im selben Ordner
const PDF_B64 = require('./pdf_b64');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // ── Parse body ──────────────────────────────────────────────────────────
    let body = req.body;
    if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
      const rawBody = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => { data += chunk; });
        req.on('end', () => resolve(data));
        req.on('error', reject);
      });
      if (!rawBody || rawBody.trim() === '') {
        return res.status(400).json({ error: 'Leerer Request-Body' });
      }
      body = JSON.parse(rawBody);
    } else if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    // ── Felder auslesen ──────────────────────────────────────────────────────
    const {
      vorname, nachname, email, telefon,
      unternehmen, position, branche, groesse,
      nachricht, newsletter, notify_check
    } = body;

    // ── Validierung ──────────────────────────────────────────────────────────
    if (!vorname || !nachname || !email || !unternehmen) {
      return res.status(400).json({ error: 'Pflichtfelder fehlen (vorname, nachname, email, unternehmen)' });
    }
    if (!telefon || String(telefon).trim().length < 6) {
      return res.status(400).json({ error: 'Pflichtfeld Telefon fehlt oder zu kurz' });
    }

    const newsletterJa  = newsletter   === 'ja';
    const notifyJa      = notify_check === 'ja';
    const newsletterTxt = newsletterJa ? 'Ja' : 'Nein';
    const notifyTxt     = notifyJa     ? 'Ja' : 'Nein';
    const listIds       = newsletterJa ? [2, 3] : [2];

    // ── 1. Brevo: Kontakt anlegen / aktualisieren ────────────────────────────
    const contactRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept':       'application/json',
        'content-type': 'application/json',
        'api-key':      process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        email: email.trim(),
        attributes: {
          VORNAME:          vorname.trim(),
          NACHNAME:         nachname.trim(),
          FIRMA:            unternehmen.trim(),
          TELEFON:          telefon.trim(),
          POSITION:         position   || '',
          BRANCHE:          branche    || '',
          GROESSE:          groesse    || '',
          HERAUSFORDERUNG:  nachricht  || '',
          NEWSLETTER:       newsletterTxt,
          HUMANFIT_SAAS:    notifyTxt
        },
        listIds,
        updateEnabled: true
      })
    });

    if (!contactRes.ok) {
      const errText = await contactRes.text();
      console.error('Brevo contact error:', contactRes.status, errText);
      // Non-fatal — weiter
    }

    // ── 2. Brevo: Persönliche E-Mail mit PDF-Anhang → Interessent ───────────
    const confirmPayload = {
      sender: { name: 'Marc Bergmann · BMB Deutschland', email: 'info@bmbdeutschland.de' },
      to: [{ email: email.trim(), name: `${vorname.trim()} ${nachname.trim()}` }],
      replyTo: { email: 'info@bmbdeutschland.de', name: 'Marc Bergmann' },
      subject: 'Ihr HumanFit Whitepaper – Wenn Organisationen die falschen Fragen stellen',

      // ── PDF-Anhang ──
      attachment: [{
        content: PDF_B64,
        name:    'HumanFit_Whitepaper_Maerz_2026.pdf'
      }],

      htmlContent: `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F4F5F7;font-family:Arial,sans-serif;">

  <!-- Header -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1B3E;padding:28px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0">
        <tr><td style="color:#E87425;font-size:12px;font-weight:bold;letter-spacing:2px;padding-bottom:6px;">
          BMB DEUTSCHLAND GMBH
        </td></tr>
        <tr><td style="color:#ffffff;font-size:20px;font-weight:bold;">
          HumanFit Matrix — Ihr Whitepaper
        </td></tr>
      </table>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#E87425;height:3px;"><tr><td></td></tr></table>

  <!-- Body -->
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:36px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:4px;">
        <tr><td style="padding:36px 44px;">

          <p style="font-size:16px;color:#0D1B3E;margin:0 0 6px;">Hallo ${vorname.trim()},</p>
          <p style="font-size:13px;color:#6B7280;margin:0 0 22px;">${[position, unternehmen].filter(Boolean).join(' · ')}</p>

          <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 18px;">
            vielen Dank für Ihr Interesse. Im Anhang finden Sie das vollständige Whitepaper —
            <strong style="color:#0D1B3E;">„Wenn Organisationen die falschen Fragen stellen:
            Ein Zwei-Ebenen-Modell für Entscheider in der Dauerkrise"</strong>.
          </p>

          <!-- Was Sie erwartet -->
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="background:#EEF1F8;border-left:4px solid #E87425;margin:20px 0;border-radius:2px;">
            <tr><td style="padding:18px 22px;">
              <p style="font-size:12px;font-weight:bold;color:#0D1B3E;margin:0 0 10px;
                         text-transform:uppercase;letter-spacing:1px;">Was Sie erwartet</p>
              <p style="font-size:14px;color:#374151;line-height:1.9;margin:0;">
                ● &nbsp;HumanFit Matrix: 5 Realitäten × 8 Bedürfnisdimensionen<br>
                ● &nbsp;Hotspot B2 × D2/D3/D6/D8 — der aggressivste Cluster<br>
                ● &nbsp;8 Frühwarnsignale — konkret und sofort beobachtbar<br>
                ● &nbsp;Maschinenbau-Case: 140 Agents, 6 Wochen, messbare Ergebnisse<br>
                ● &nbsp;5 Selbstdiagnose-Fragen — für heute, nach diesem Lesen
              </p>
            </td></tr>
          </table>

          <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 18px;">
            Wenn nach der Lektüre Fragen entstehen oder Sie einen konkreten Fall besprechen möchten —
            ich bin erreichbar:
          </p>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" style="margin:22px 0;">
            <tr><td style="background:#E87425;border-radius:3px;padding:13px 30px;">
              <a href="mailto:info@bmbdeutschland.de?subject=Discovery%20nach%20Whitepaper"
                 style="color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">
                Gespräch vereinbaren →
              </a>
            </td></tr>
          </table>

          ${notifyJa ? `<p style="font-size:14px;color:#374151;line-height:1.7;margin:16px 0 0;">
            Sie werden benachrichtigt, sobald der <strong>HumanFit Check (SaaS)</strong> verfügbar ist.</p>` : ''}
          ${newsletterJa ? `<p style="font-size:14px;color:#374151;line-height:1.7;margin:10px 0 0;">
            Sie erhalten ab sofort unseren Newsletter. Abmeldung jederzeit möglich.</p>` : ''}

          <p style="font-size:14px;color:#374151;line-height:1.7;margin:26px 0 0;">
            Mit freundlichen Grüßen,<br>
            <strong style="color:#0D1B3E;">Marc Bergmann</strong><br>
            <span style="color:#6B7280;font-size:13px;">BMB Deutschland GmbH · Mittelstraße 23 · 40721 Hilden</span>
          </p>

        </td></tr>

        <!-- Footer -->
        <tr><td style="border-top:1px solid #E8E9EC;padding:18px 44px;">
          <p style="font-size:11px;color:#6B7280;margin:0;line-height:1.6;">
            Sie erhalten diese E-Mail, weil Sie das HumanFit Whitepaper auf
            <a href="https://www.bmbdeutschland.de" style="color:#E87425;">www.bmbdeutschland.de</a>
            angefordert haben.<br>
            <a href="https://www.bmbdeutschland.de/datenschutz" style="color:#E87425;">Datenschutz</a> ·
            <a href="mailto:info@bmbdeutschland.de" style="color:#E87425;">info@bmbdeutschland.de</a> ·
            +49 (0) 2103 / 33 399-0
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
    };

    const emailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept':       'application/json',
        'content-type': 'application/json',
        'api-key':      process.env.BREVO_API_KEY
      },
      body: JSON.stringify(confirmPayload)
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error('Brevo confirm email error:', emailRes.status, errText);
    }

    // ── 3. Brevo: Interne Benachrichtigung → BMB ─────────────────────────────
    const notifyRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept':       'application/json',
        'content-type': 'application/json',
        'api-key':      process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: 'BMB Website', email: 'info@bmbdeutschland.de' },
        to: [{ email: 'info@bmbdeutschland.de', name: 'BMB Deutschland' }],
        subject: `🔔 Neuer Whitepaper-Download: ${vorname.trim()} ${nachname.trim()} – ${unternehmen.trim()}`,
        htmlContent: `
          <div style="font-family:sans-serif;padding:24px;max-width:560px;">
            <h2 style="color:#1a3b55;border-bottom:2px solid #e87425;padding-bottom:10px;margin-bottom:18px;">
              Neuer Whitepaper-Download
            </h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:7px 0;color:#7a8d9e;width:160px;"><strong>Name</strong></td>
                  <td style="padding:7px 0;color:#1a2b3c;">${vorname.trim()} ${nachname.trim()}</td></tr>
              <tr><td style="padding:7px 0;color:#7a8d9e;"><strong>E-Mail</strong></td>
                  <td style="padding:7px 0;"><a href="mailto:${email.trim()}" style="color:#e87425;">${email.trim()}</a></td></tr>
              <tr><td style="padding:7px 0;color:#7a8d9e;"><strong>Telefon</strong></td>
                  <td style="padding:7px 0;color:#1a2b3c;">${telefon || '–'}</td></tr>
              <tr><td style="padding:7px 0;color:#7a8d9e;"><strong>Unternehmen</strong></td>
                  <td style="padding:7px 0;color:#1a2b3c;">${unternehmen.trim()}</td></tr>
              <tr><td style="padding:7px 0;color:#7a8d9e;"><strong>Position</strong></td>
                  <td style="padding:7px 0;color:#1a2b3c;">${position || '–'}</td></tr>
              <tr><td style="padding:7px 0;color:#7a8d9e;"><strong>Branche</strong></td>
                  <td style="padding:7px 0;color:#1a2b3c;">${branche || '–'}</td></tr>
              <tr><td style="padding:7px 0;color:#7a8d9e;"><strong>Teamgröße</strong></td>
                  <td style="padding:7px 0;color:#1a2b3c;">${groesse || '–'}</td></tr>
              <tr><td style="padding:7px 0;color:#7a8d9e;"><strong>Herausforderung</strong></td>
                  <td style="padding:7px 0;color:#1a2b3c;">${nachricht || '–'}</td></tr>
            </table>
            <hr style="border:none;border-top:1px solid #edf0f4;margin:14px 0;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:6px 0;color:#7a8d9e;width:160px;"><strong>Newsletter</strong></td>
                  <td style="padding:6px 0;font-weight:700;color:${newsletterJa ? '#27ae60' : '#c0392b'};">${newsletterTxt}</td></tr>
              <tr><td style="padding:6px 0;color:#7a8d9e;"><strong>HumanFit SaaS</strong></td>
                  <td style="padding:6px 0;font-weight:700;color:${notifyJa ? '#27ae60' : '#c0392b'};">${notifyTxt}</td></tr>
            </table>
          </div>
        `
      })
    });

    if (!notifyRes.ok) {
      const errText = await notifyRes.text();
      console.error('Brevo notify error (non-critical):', notifyRes.status, errText);
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
}

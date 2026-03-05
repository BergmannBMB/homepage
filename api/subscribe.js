export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ── Parse body ──
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

    // ── Destructure ALL fields ──
    const {
      vorname,
      nachname,
      email,
      telefon,
      unternehmen,
      position,
      branche,
      groesse,
      nachricht,
      newsletter,
      notify_check
    } = body;

    // ── Validate required fields ──
    if (!vorname || !nachname || !email || !unternehmen) {
      return res.status(400).json({ error: 'Pflichtfelder fehlen (vorname, nachname, email, unternehmen)' });
    }
    if (!telefon || String(telefon).trim().length < 6) {
      return res.status(400).json({ error: 'Pflichtfeld Telefon fehlt oder zu kurz' });
    }

    const newsletterJa = newsletter === 'ja';
    const notifyJa     = notify_check === 'ja';
    const newsletterTxt = newsletterJa ? 'Ja' : 'Nein';
    const notifyTxt     = notifyJa     ? 'Ja' : 'Nein';

    // ── List IDs: 2 = Whitepaper-Downloads, 3 = Newsletter ──
    const listIds = newsletterJa ? [2, 3] : [2];

    // ── 1. Brevo: Create / update contact ──
    const contactPayload = {
      email: email.trim(),
      attributes: {
        VORNAME:       vorname.trim(),
        NACHNAME:      nachname.trim(),
        FIRMA:         unternehmen.trim(),
        TELEFON:       telefon.trim(),
        POSITION:      position      || '',
        BRANCHE:       branche       || '',
        GROESSE:       groesse       || '',
        HERAUSFORDERUNG: nachricht   || '',
        NEWSLETTER:    newsletterTxt,
        HUMANFIT_SAAS: notifyTxt
      },
      listIds,
      updateEnabled: true
    };

    const contactRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept':       'application/json',
        'content-type': 'application/json',
        'api-key':      process.env.BREVO_API_KEY
      },
      body: JSON.stringify(contactPayload)
    });

    if (!contactRes.ok) {
      const errText = await contactRes.text();
      console.error('Brevo contact error:', contactRes.status, errText);
      // Non-fatal: continue even if contact update fails (e.g. already exists with different list)
    }

    // ── 2. Brevo: Confirmation e-mail to registrant ──
    const confirmPayload = {
      sender: { name: 'BMB Deutschland', email: 'info@bmbdeutschland.de' },
      to: [{ email: email.trim(), name: `${vorname.trim()} ${nachname.trim()}` }],
      subject: 'Ihr Whitepaper – BMB HumanFit Matrix',
      htmlContent: `
        <div style="font-family:Calibri,sans-serif;max-width:600px;margin:0 auto;padding:32px;">
          <div style="border-bottom:2px solid #e87425;padding-bottom:14px;margin-bottom:22px;">
            <strong style="color:#1a3b55;font-size:1.1rem;">BMB</strong>
            <span style="color:#e87425;font-size:1.1rem;"> HumanFit Check</span>
          </div>
          <h2 style="color:#1a3b55;margin-bottom:10px;">Hallo ${vorname.trim()},</h2>
          <p style="color:#4a6072;line-height:1.7;margin-bottom:12px;">
            vielen Dank für Ihr Interesse am Whitepaper <strong>Wenn Organisationen die falschen Fragen stellen</strong>.
          </p>
          <p style="color:#4a6072;line-height:1.7;margin-bottom:12px;">
            Wir melden uns in Kürze mit Ihrem Download-Link.
          </p>
          ${notifyJa ? `<p style="color:#4a6072;line-height:1.7;margin-bottom:12px;">Sie werden benachrichtigt, sobald der <strong>HumanFit Check (SaaS)</strong> verfügbar ist.</p>` : ''}
          ${newsletterJa ? `<p style="color:#4a6072;line-height:1.7;margin-bottom:12px;">Sie erhalten ab sofort unseren Newsletter. Abmeldung jederzeit möglich.</p>` : ''}
          <hr style="border:none;border-top:1px solid #edf0f4;margin:24px 0;">
          <p style="color:#7a8d9e;font-size:11px;line-height:1.6;">
            BMB Deutschland GmbH · Mittelstraße 23 · 40721 Hilden<br>
            <a href="https://www.bmbdeutschland.de" style="color:#e87425;">www.bmbdeutschland.de</a>
          </p>
        </div>
      `
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

    // ── 3. Brevo: Internal notification to BMB ──
    const notifyPayload = {
      sender: { name: 'BMB Website', email: 'info@bmbdeutschland.de' },
      to: [{ email: 'info@bmbdeutschland.de', name: 'BMB Deutschland' }],
      subject: `Neuer Whitepaper-Download: ${vorname.trim()} ${nachname.trim()} – ${unternehmen.trim()}`,
      htmlContent: `
        <div style="font-family:sans-serif;padding:24px;max-width:560px;">
          <h2 style="color:#1a3b55;border-bottom:2px solid #e87425;padding-bottom:10px;margin-bottom:18px;">
            Neuer Whitepaper-Download
          </h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:6px 0;color:#7a8d9e;width:160px;"><strong>Name</strong></td><td style="padding:6px 0;color:#1a2b3c;">${vorname.trim()} ${nachname.trim()}</td></tr>
            <tr><td style="padding:6px 0;color:#7a8d9e;"><strong>E-Mail</strong></td><td style="padding:6px 0;color:#1a2b3c;">${email.trim()}</td></tr>
            <tr><td style="padding:6px 0;color:#7a8d9e;"><strong>Telefon</strong></td><td style="padding:6px 0;color:#1a2b3c;">${telefon.trim() || '–'}</td></tr>
            <tr><td style="padding:6px 0;color:#7a8d9e;"><strong>Unternehmen</strong></td><td style="padding:6px 0;color:#1a2b3c;">${unternehmen.trim()}</td></tr>
            <tr><td style="padding:6px 0;color:#7a8d9e;"><strong>Position</strong></td><td style="padding:6px 0;color:#1a2b3c;">${position || '–'}</td></tr>
            <tr><td style="padding:6px 0;color:#7a8d9e;"><strong>Branche</strong></td><td style="padding:6px 0;color:#1a2b3c;">${branche || '–'}</td></tr>
            <tr><td style="padding:6px 0;color:#7a8d9e;"><strong>Größe</strong></td><td style="padding:6px 0;color:#1a2b3c;">${groesse || '–'}</td></tr>
            <tr><td style="padding:6px 0;color:#7a8d9e;"><strong>Herausforderung</strong></td><td style="padding:6px 0;color:#1a2b3c;">${nachricht || '–'}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #edf0f4;margin:16px 0;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:6px 0;color:#7a8d9e;width:160px;"><strong>Newsletter</strong></td><td style="padding:6px 0;font-weight:700;color:${newsletterJa ? '#27ae60' : '#c0392b'};">${newsletterTxt}</td></tr>
            <tr><td style="padding:6px 0;color:#7a8d9e;"><strong>HumanFit SaaS</strong></td><td style="padding:6px 0;font-weight:700;color:${notifyJa ? '#27ae60' : '#c0392b'};">${notifyTxt}</td></tr>
          </table>
        </div>
      `
    };

    const notifyRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept':       'application/json',
        'content-type': 'application/json',
        'api-key':      process.env.BREVO_API_KEY
      },
      body: JSON.stringify(notifyPayload)
    });

    if (!notifyRes.ok) {
      const errText = await notifyRes.text();
      console.error('Brevo notify email error:', notifyRes.status, errText);
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
}

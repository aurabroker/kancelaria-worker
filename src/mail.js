/* ============================================================
   POWIADOMIENIA O LEADACH — RESEND
   ------------------------------------------------------------
   Klucz API NIE jest w repozytorium. Worker czyta go ze
   zmiennej środowiskowej RESEND_API_KEY, ustawianej jako
   sekret:  wrangler secret put RESEND_API_KEY

   Domena nadawcza rozwod.waw.pl jest zweryfikowana w Resend,
   dlatego wszystkie jedenaście serwisów wysyła z tego adresu.

   ŚWIADOMA DECYZJA: nie wysyłamy automatycznej odpowiedzi do
   klienta. Wiadomość o sprawie rozwodowej trafiająca do
   współdzielonej skrzynki domowej może ujawnić zamiary klienta
   drugiemu małżonkowi. Powiadomienie idzie wyłącznie do
   kancelarii. Aby to zmienić, ustaw AUTOREPLY na true — ale
   najpierw rozważ powyższe ryzyko.
   ============================================================ */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const FROM = "Formularz rozwod.waw.pl <formularz@rozwod.waw.pl>";
const AUTOREPLY = false;

/**
 * Zwraca wartosc sekretu niezaleznie od typu powiazania w Cloudflare.
 * Powiazanie typu "Secret" daje wprost napis. Powiazanie typu
 * "Secrets Store Secret" daje obiekt, z ktorego wartosc wyciaga sie
 * asynchronicznie przez .get(). Obsluga obu form kosztuje trzy linie
 * i eliminuje cala klase bledow konfiguracyjnych.
 */
async function readSecret(binding) {
  if (!binding) return "";
  if (typeof binding === "string") return binding;
  if (typeof binding.get === "function") {
    try { return (await binding.get()) || ""; } catch { return ""; }
  }
  return "";
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function row(label, value) {
  if (!value) return "";
  return `<tr><td style="padding:6px 14px 6px 0;color:#57616E;white-space:nowrap;vertical-align:top">${esc(label)}</td>` +
         `<td style="padding:6px 0;color:#11161C"><strong>${esc(value)}</strong></td></tr>`;
}

/**
 * Wysyła powiadomienie o nowym zgłoszeniu do kancelarii.
 * Nigdy nie rzuca wyjątkiem — brak klucza albo błąd Resend nie
 * może przerwać obsługi formularza, bo lead jest już w Supabase.
 * Zwraca { sent: boolean, reason?: string }.
 */
export async function sendLeadNotification(env, lead, firm) {
  const key = await readSecret(env && env.RESEND_API_KEY);
  if (!key) return { sent: false, reason: "brak RESEND_API_KEY" };

  const subject = `Nowe zgłoszenie: ${lead.imie || "bez imienia"} — ${lead.dzielnica || lead.zrodlo_domena}`;
  const utm = [lead.utm_source, lead.utm_medium, lead.utm_campaign, lead.utm_content, lead.utm_term]
    .filter(Boolean).join(" / ");

  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.55;color:#11161C">
<h2 style="font-size:17px;margin:0 0 4px">Nowe zgłoszenie z formularza</h2>
<p style="margin:0 0 16px;color:#57616E;font-size:13px">${esc(lead.zrodlo_domena)} &middot; ${esc(lead.dzielnica || "")}</p>
<table style="border-collapse:collapse;font-size:15px">
${row("Imię", lead.imie)}
${row("Telefon", lead.telefon)}
${row("E-mail", lead.email)}
${row("Temat", lead.temat)}
${row("Kampania", utm)}
</table>
${lead.wiadomosc ? `<p style="margin:16px 0 6px;color:#57616E;font-size:13px">Opis sytuacji</p>
<div style="white-space:pre-wrap;background:#F4F6F8;border-left:3px solid #C3CBD4;padding:10px 14px">${esc(lead.wiadomosc)}</div>` : ""}
<p style="margin:20px 0 0;color:#7C8794;font-size:12px">Oddzwonić w ciągu 2 godzin w dni robocze (pn–pt 9:00–17:00).</p>
</div>`;

  const payload = {
    from: FROM,
    to: [firm.email],
    subject,
    html,
    // Odpowiedź z klienta poczty trafia wprost do zgłaszającego.
    ...(lead.email ? { reply_to: lead.email } : {}),
  };

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error("resend:", res.status, (await res.text()).slice(0, 300));
      return { sent: false, reason: `HTTP ${res.status}` };
    }
    return { sent: true };
  } catch (e) {
    console.error("resend:", e instanceof Error ? e.message : String(e));
    return { sent: false, reason: "wyjątek sieciowy" };
  }
}

export { AUTOREPLY };

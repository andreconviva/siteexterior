import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const imageRoot = path.join(root, "public", "images");
const residenceRoot = path.join(imageRoot, "residences");
const output = path.join(root, "public", "Conviva-site-review.html");

const residences = [
  ["brise", "Brise by Conviva", "Camboinhas", "Studios, 1 e 2 quartos", "37,94–94,99 m²", "Rooftop, uso híbrido e praia próxima para estadias curtas ou longas.", "Em lançamento"],
  ["life-inga", "Life Ingá", "Ingá", "Studios, 1 e 2 quartos", "32,58–67,33 m²", "Plantas compactas, serviços e conexão com a vida urbana de Niterói.", "Em lançamento"],
  ["life-camboinhas", "Life Camboinhas", "Camboinhas", "1, 2 e 3 quartos", "37,43–123,66 m²", "Flexibilidade para famílias, lazer no rooftop e atmosfera perto do mar.", "Em lançamento"],
  ["conviva-camboinhas", "Conviva Camboinhas", "Camboinhas", "1 quarto e double suítes", "41–109 m²", "Endereço residencial com lazer, tecnologia e controle de acesso.", "Em lançamento"],
  ["conviva-icarai", "Conviva Icaraí", "Icaraí", "Studios e gardens", "31,70–83,65 m²", "Praia e cidade a pé, com studios e gardens para uso flexível.", "Em lançamento"],
  ["conviva-itacoa", "Conviva Itacoa", "Itaipu", "Sala-quarto e coberturas", "39,03–62,33 m²", "Mar, montanha e natureza preservada para viver suas temporadas.", "Em lançamento"],
  ["nice-camboinhas", "Nice Camboinhas", "Camboinhas", "2, 3 e 4 quartos", "66,25–327,84 m²", "Unidades amplas, lazer completo e um refúgio para famílias.", "Em lançamento"],
  ["conviva-piratininga", "Conviva Piratininga", "Piratininga", "1 quarto com 2 banheiros", "36,11–88,55 m²", "Empreendimento entregue perto da praia e integrado à natureza.", "Concluído"],
  ["conviva-inga", "Conviva Ingá", "Ingá", "Studios e 1 quarto", "32,57–101,65 m²", "Empreendimento entregue em uma localização urbana, cultural e próxima à praia.", "Concluído"],
];

const escapeHtml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const dataUri = async (file, mime) => `data:${mime};base64,${(await fs.readFile(file)).toString("base64")}`;

const logo = await dataUri(path.join(imageRoot, "conviva-logo.svg"), "image/svg+xml");
const coast = await dataUri(path.join(imageRoot, "niteroi-coast.jpg"), "image/jpeg");

const residenceMarkup = await Promise.all(residences.map(async ([slug, name, neighborhood, typology, area, summary, status]) => {
  const images = await Promise.all(Array.from({ length: 8 }, (_, index) => dataUri(path.join(residenceRoot, `${slug}-${index + 1}.webp`), "image/webp")));
  return `
    <section class="residence" id="${slug}">
      <div class="residence-head">
        <div><p class="eyebrow">${escapeHtml(neighborhood)} · ${escapeHtml(status)}</p><h3>${escapeHtml(name)}</h3><p class="lead">${escapeHtml(summary)}</p></div>
        <div class="facts"><span><b>Tipologias</b>${escapeHtml(typology)}</span><span><b>Metra­gens</b>${escapeHtml(area)}</span></div>
      </div>
      <div class="gallery">${images.map((image, index) => `<figure class="gallery-item ${index === 0 ? "wide" : ""}"><img src="${image}" alt="${escapeHtml(name)} — imagem ${index + 1}" loading="lazy"></figure>`).join("")}</div>
    </section>`;
}));

const opportunityCards = await Promise.all(residences.slice(0, 7).map(async ([slug, name, neighborhood, typology, area, summary, status]) => `<article class="card"><a href="#${slug}"><img src="${await dataUri(path.join(residenceRoot, `${slug}-1.webp`), "image/webp")}" alt="${escapeHtml(name)}"><p class="eyebrow">${escapeHtml(neighborhood)} · ${escapeHtml(status)}</p><h3>${escapeHtml(name)}</h3><p>${escapeHtml(typology)} · ${escapeHtml(area)}</p><p>${escapeHtml(summary)}</p></a></article>`));

const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Conviva · Site internacional — revisão</title>
  <style>
    :root{--ink:#123c35;--muted:#61766f;--paper:#f4f6f1;--surface:#fff;--accent:#c86537;--line:#d9e1d9}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font-family:Arial,Helvetica,sans-serif;line-height:1.5}a{color:inherit}.wrap{width:min(1180px,calc(100% - 48px));margin:auto}.topbar{position:sticky;top:0;z-index:10;background:rgba(244,246,241,.94);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}.topbar-inner{display:flex;align-items:center;justify-content:space-between;gap:24px;min-height:74px}.topbar img{width:130px;height:auto}.nav{display:flex;gap:22px;font-size:12px;letter-spacing:.08em;text-transform:uppercase}.nav a{text-decoration:none}.button{display:inline-flex;align-items:center;gap:10px;background:var(--ink);color:#fff;padding:13px 18px;text-decoration:none;font-size:12px;letter-spacing:.08em;text-transform:uppercase}.hero{min-height:78vh;display:grid;align-items:end;padding:120px 0 80px;background:linear-gradient(90deg,rgba(10,35,30,.84),rgba(10,35,30,.12)),url('${await dataUri(path.join(residenceRoot,"brise-1.webp"),"image/webp")}') center/cover;color:#fff}.hero h1{font:500 clamp(44px,8vw,92px)/.98 Georgia,serif;letter-spacing:-.05em;max-width:800px;margin:12px 0 24px}.hero p{max-width:560px;color:rgba(255,255,255,.8);font-size:18px}.eyebrow{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin:0 0 12px}.section{padding:100px 0}.section h2{font:500 clamp(34px,5vw,62px)/1.02 Georgia,serif;letter-spacing:-.04em;margin:0 0 20px}.intro{max-width:700px;color:var(--muted);font-size:18px}.location{display:grid;grid-template-columns:1fr 1.2fr;gap:70px;align-items:center}.location img{width:100%;height:520px;object-fit:cover}.pills{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line);margin-top:40px}.pill{background:var(--surface);padding:24px}.pill b{display:block;font:500 24px Georgia,serif;margin-bottom:8px}.collection{background:var(--surface)}.collection h2{max-width:650px}.cards{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin-top:46px}.card{border-top:1px solid var(--line);padding-top:16px}.card a{text-decoration:none}.card h3{font:500 30px Georgia,serif;margin:8px 0}.card img{width:100%;aspect-ratio:16/10;object-fit:cover}.card p{color:var(--muted);margin:8px 0}.all-residences{background:#e7eee8}.residence{padding:82px 0;border-top:1px solid var(--line)}.residence:first-child{border-top:0}.residence-head{display:grid;grid-template-columns:1.4fr .8fr;gap:40px;align-items:end;margin-bottom:34px}.residence h3{font:500 clamp(34px,5vw,62px)/1 Georgia,serif;letter-spacing:-.04em;margin:0}.lead{color:var(--muted);font-size:17px;max-width:620px}.facts{display:grid;gap:14px;border-left:1px solid var(--line);padding-left:24px;color:var(--muted)}.facts span{display:grid;gap:2px}.facts b{text-transform:uppercase;font-size:10px;letter-spacing:.12em;color:var(--ink)}.gallery{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.gallery-item{margin:0;aspect-ratio:1.1;overflow:hidden;background:#d9e1d9}.gallery-item.wide{grid-column:span 2;grid-row:span 2}.gallery img{width:100%;height:100%;object-fit:cover;display:block}.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--line);margin-top:44px}.step{background:var(--paper);padding:22px}.step strong{font:500 28px Georgia,serif;display:block;margin-bottom:10px}.step p{color:var(--muted);margin:0}.contact{background:var(--ink);color:#fff}.contact .intro{color:rgba(255,255,255,.72)}.form{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-top:34px;max-width:760px}.form input,.form textarea{width:100%;border:1px solid rgba(255,255,255,.25);background:transparent;color:#fff;padding:15px;font:inherit}.form textarea{min-height:120px;grid-column:1/-1}.form .button{background:var(--accent);border:0}.footer{padding:38px 0;color:var(--muted);font-size:12px;border-top:1px solid var(--line)}@media(max-width:800px){.wrap{width:min(100% - 32px,620px)}.nav{display:none}.location,.residence-head{grid-template-columns:1fr;gap:30px}.location img{height:360px}.cards{grid-template-columns:1fr}.pills,.steps{grid-template-columns:1fr}.gallery{grid-template-columns:repeat(2,1fr)}.gallery-item.wide{grid-column:span 2}.form{grid-template-columns:1fr}.form textarea{grid-column:auto}.section{padding:70px 0}}
  </style>
</head>
<body>
  <header class="topbar"><div class="wrap topbar-inner"><a href="#top"><img src="${logo}" alt="Conviva"></a><nav class="nav"><a href="#location">Niterói</a><a href="#opportunities">Oportunidades</a><a href="#portfolio">Empreendimentos</a><a href="#contact">Contato</a></nav><a class="button" href="#contact">Solicitar detalhes</a></div></header>
  <main id="top">
    <section class="hero"><div class="wrap"><p class="eyebrow" style="color:#f2b18c">Niterói · diante do Rio de Janeiro</p><h1>Invista perto do Rio. Tenha o seu lugar no Brasil.</h1><p>Imóveis contemporâneos em Niterói para construir patrimônio e aproveitar suas férias.</p><a class="button" href="#opportunities" style="margin-top:18px">Conhecer oportunidades ↓</a></div></section>
    <section class="section" id="location"><div class="wrap location"><div><p class="eyebrow">O território</p><h2>O Rio no horizonte. Niterói aos seus pés.</h2><p class="intro">Uma cidade costeira com praias, natureza, cultura e serviços, conectada à região metropolitana do Rio e com uma rotina mais tranquila.</p><div class="pills"><div class="pill"><b>Urbano</b><span>Ingá e Icaraí aproximam praia, cultura e serviços.</span></div><div class="pill"><b>Praia</b><span>Camboinhas e Piratininga perto do mar.</span></div><div class="pill"><b>Natureza</b><span>Itaipu une oceano, montanha e paisagem preservada.</span></div></div></div><img src="${coast}" alt="Litoral de Niterói"></div></section>
    <section class="section collection" id="opportunities"><div class="wrap"><p class="eyebrow">Portfólio Conviva</p><h2>Oportunidades para diferentes planos.</h2><p class="intro">Projetos contemporâneos em endereços desejados de Niterói. Disponibilidade e condições sob consulta.</p><div class="cards">${opportunityCards.join("")}</div></div></section>
    <section class="section all-residences" id="portfolio"><div class="wrap"><p class="eyebrow">Empreendimentos</p><h2>Conheça cada endereço.</h2><p class="intro">Galerias ampliadas com as perspectivas disponíveis para cada projeto.</p>${residenceMarkup.join("")}</div></section>
    <section class="section"><div class="wrap"><p class="eyebrow">Jornada internacional</p><h2>Comprar do exterior, com clareza em cada etapa.</h2><p class="intro">A equipe acompanha a descoberta, a análise e a documentação. Condições e disponibilidade são confirmadas diretamente com a Conviva.</p><div class="steps"><div class="step"><strong>01</strong><p>Descoberta<br>Conte seus objetivos.</p></div><div class="step"><strong>02</strong><p>Análise<br>Compare plantas e metragens.</p></div><div class="step"><strong>03</strong><p>Decisão<br>Avance com orientação.</p></div><div class="step"><strong>04</strong><p>Acompanhamento<br>Informação até as chaves.</p></div></div></div></section>
    <section class="section contact" id="contact"><div class="wrap"><p class="eyebrow" style="color:#f2b18c">Próximo passo</p><h2>Receba oportunidades alinhadas ao seu plano.</h2><p class="intro">Conte o que procura. Nossa equipe retornará com informações atuais e relevantes.</p><form class="form" onsubmit="return false"><input placeholder="Nome completo"><input placeholder="E-mail"><input placeholder="País de residência"><input placeholder="Telefone com código do país"><textarea placeholder="Mensagem"></textarea><button class="button" type="submit">Solicitar detalhes</button></form></div></section>
  </main>
  <footer class="footer"><div class="wrap">Conviva · Site internacional — arquivo de revisão para aprovação. Imagens ilustrativas; disponibilidade e especificações devem ser confirmadas.</div></footer>
</body></html>`;

await fs.writeFile(output, html, "utf8");
console.log(`Created ${output} (${Math.round(Buffer.byteLength(html) / 1024 / 1024)} MB)`);

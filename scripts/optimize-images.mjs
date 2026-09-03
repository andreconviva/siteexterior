import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceRoot = "C:/SITE EXTERIOR/Perspectivas";
const outputRoot = "C:/SITE EXTERIOR/site/public/images/residences";

const selections = [
  ["Perspectivas - Brise", [["Piscina - Vista 02"], ["COL 01", "Sala - Vista 01"], ["Area gourmet", "Vista 01"], ["Rooftop - Academia"], ["Rooftop - Coworking"], ["Rooftop - Lavanderia"], ["Terreo - Bicicletario"], ["Terreo - Minimercado"]]],
  ["Perspectivas - Conviva Life Ingá", [["PauloAlves 03-alta"], ["Piscina - Vista 01"], ["Apartamento 01", "Sala de estar"], ["Academia"], ["Área gourmet", "Vista 01"], ["Coworking - Vista externa"], ["Lavanderia"], ["Pet care"]]],
  ["Perspectivas - Conviva Life Camboinhas", [["Exterior - A"], ["Sala A"], ["Quarto verde A"], ["Cozinha A"], ["Banheiro A"], ["Escritório A"], ["Interior - A"], ["Varanda A"]]],
  ["Perspectivas - Conviva Camboinhas", [["A1-fachada"], ["C6-", "Piscina Adulto"], ["B10-", "Sala"], ["C4-Academia"], ["C9-Sky Lounge"], ["C13-Sunset Rooftop"], ["C14-Pet Park"], ["C18-Bicicletario"]]],
  ["Perspectivas - Conviva Icaraí", [["FACHADA VISTA ALTA"], ["Piscina - Vista 01"], ["Apartamento - Vista 01"], ["Rooftop - Coworking"], ["Rooftop - Fitness"], ["Rooftop - Gourmet"], ["Terraço crossfit"], ["Térreo - Delivery"]]],
  ["Perspectivas - Conviva Itacoa", [["Fachada - Vista geral"], ["Rooftop - Piscina"], ["Apartamento - Sala de estar"], ["Fachada - Vista lagoa"], ["Rooftop - Gourmet"], ["Rooftop - Fitness"], ["Apartamento - Varanda 02"], ["Banheiro"]]],
  ["Perspectivas - Nice", [["FACHADA 01"], ["PUC - Piscina"], ["Apartamento - Sala"], ["FACHADA 02"], ["PUC - Gourmet"], ["PUC - Fitness"], ["Apartamento - Varanda"], ["PUC - Spa"]]],
  ["perspectivas - Conviva Piratininga", [["Fachada CVIVA"], ["Sala 406"], ["Academia"], ["Piratininga noite"], ["Suite 403"], ["Coworking"], ["Coffee Break"], ["Espaço Zen"]]],
  ["Perspectivas - Conviva Ingá", [["A-fachada"], ["Piscina"], ["Sala Col03"], ["Inga - Fitness"], ["Coworking"], ["Churrasqueira"], ["Varanda Col10"], ["Lavanderia"]]],
];

const slugs = ["brise", "life-inga", "life-camboinhas", "conviva-camboinhas", "conviva-icarai", "conviva-itacoa", "nice-camboinhas", "conviva-piratininga", "conviva-inga"];

await fs.mkdir(outputRoot, { recursive: true });

for (let projectIndex = 0; projectIndex < selections.length; projectIndex += 1) {
  const [folder, patterns] = selections[projectIndex];
  const folderPath = path.join(sourceRoot, folder);
  const files = await fs.readdir(folderPath);
  for (let imageIndex = 0; imageIndex < patterns.length; imageIndex += 1) {
    const terms = patterns[imageIndex].map((term) => term.toLocaleLowerCase("pt-BR"));
    const file = files.find((name) => terms.every((term) => name.toLocaleLowerCase("pt-BR").includes(term)));
    if (!file) throw new Error(`Image not found: ${folder} / ${patterns[imageIndex].join(" + ")}`);
    const output = path.join(outputRoot, `${slugs[projectIndex]}-${imageIndex + 1}.webp`);
    await sharp(path.join(folderPath, file), { limitInputPixels: false }).rotate().resize({ width: 1800, height: 1200, fit: "cover", position: "attention", withoutEnlargement: true }).webp({ quality: 82 }).toFile(output);
    console.log(`${file} -> ${path.basename(output)}`);
  }
}

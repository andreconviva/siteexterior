# Conviva International

Landing page internacional da Conviva para campanhas de aquisição fora do Brasil.

## Recursos

- Rotas estáticas em inglês, alemão, espanhol e português
- Detecção automática pelo idioma do navegador na raiz
- Seletor manual com preferência persistida no navegador
- SEO localizado, Open Graph, `hreflang`, sitemap e robots
- Formulário com validação, honeypot e limite básico de tentativas
- Layout responsivo, tema claro ou escuro pelo sistema e movimento reduzido

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. A raiz direciona para o idioma mais adequado.

## Produção

```bash
npm run lint
npm run build
npm start
```

Defina `NEXT_PUBLIC_SITE_URL` com o domínio final. A entrega do formulário está desativada de propósito até ser aprovado e configurado um e-mail ou CRM de destino em `src/app/api/contact/route.ts`.

# Caderno Virtual de Aulas

Aplicativo de página única para organizar disciplinas, aulas, anotações, comandos e blocos de código executáveis.

## Recursos

- salvamento automático no navegador;
- busca por aulas, anotações e comandos;
- blocos de JavaScript, Python e SQL;
- importação e exportação de backup em JSON;
- geração de material de estudo formatado para PDF;
- funcionamento sem instalação ou processo de build.

Python e SQL carregam seus respectivos motores somente quando um bloco dessas linguagens é executado. A interface funciona localmente, sem build, com `index.html`, `workspace.css`, `workspace.js` e `favicon.svg` na mesma pasta.

A interface inclui modo de leitura, comandos recolhíveis, navegação mobile e iluminação ambiente. As animações respeitam a preferência por movimento reduzido; a iluminação pausa quando a aba fica oculta.

## Executar localmente

Abra `index.html` diretamente no navegador ou inicie um servidor local:

```bash
python -m http.server 8765
```

Depois acesse `http://localhost:8765`.

## Publicar na Vercel

Importe este repositório na Vercel e mantenha o projeto como site estático, sem comando de build. Publique a raiz do repositório, incluindo os arquivos CSS, JavaScript e o favicon referenciados por `index.html`. Com a integração Git ativa, as atualizações da branch de produção geram um novo deploy.

As anotações ficam no armazenamento local de cada navegador. Use a opção **Exportar** para manter cópias de segurança em JSON.

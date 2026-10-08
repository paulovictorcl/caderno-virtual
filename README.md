# Caderno Virtual de Aulas

Aplicativo de página única para organizar disciplinas, aulas, anotações, comandos e blocos de código executáveis.

## Recursos

- salvamento automático no navegador;
- busca por aulas, anotações e comandos;
- blocos de JavaScript, Python e SQL;
- importação e exportação de backup em JSON;
- geração de material de estudo formatado para PDF;
- funcionamento sem instalação ou processo de build.

Python e SQL carregam seus respectivos motores somente quando um bloco dessas linguagens é executado. O restante do aplicativo funciona localmente em um único arquivo HTML.

## Executar localmente

Abra `index.html` diretamente no navegador ou inicie um servidor local:

```bash
python -m http.server 8765
```

Depois acesse `http://localhost:8765`.

## Publicar na Vercel

Importe este repositório na Vercel e mantenha o projeto como site estático, sem comando de build. O arquivo `index.html` na raiz será publicado automaticamente.

As anotações ficam no armazenamento local de cada navegador. Use a opção **Exportar** para manter cópias de segurança em JSON.

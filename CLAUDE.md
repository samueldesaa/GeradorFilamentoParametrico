# CLAUDE.md

Orientações para o Claude Code ao trabalhar neste repositório.

## Stack

Gerador paramétrico de filamento para impressão 3D, em português. Usa Vite, JavaScript vanilla, CSS e Three.js. Preservar essa stack salvo pedido explícito.

## Direção visual aprovada

- **Paleta A** verde folha: `#121a14` fundo, `#202a21` superfície, `#f1f4ec` texto, `#b8ef63` acento.
- **Tipografia B**: Manrope (UI), Roboto Mono (números), Momo Signature (título). Máximo três famílias.
- **Hierarquia C**: título dominante.
- **Layout B**: arejado, com espaçamento generoso entre campos.
- **Cantos C**: orgânicos (~20 px para agrupamento), pill para ações.
- **Footer/controles A**: bloco com borda suave na largura do workspace; empilha em telas estreitas. Três contatos empilhados verticalmente com ícone, identificador completo e ação: email completo + "Enviar email", GitHub e Instagram completos + links de acesso.

Não reabrir essas escolhas sem pedido. Não generalizar para outros projetos.

## Regras de conteúdo e UI

- Não inventar nome de produto, marca, rótulos promocionais, título dramático ou copy desnecessário.
- Título funcional: "Gerador paramétrico para impressão 3D".
- Texto enxuto, grande e com alto contraste. Bordas normais sutis.
- Unidades coerentes: comprimento informado em metros permanece em metros na saída.
- Diâmetro do filamento exibido junto dos campos relacionados, não em canto decorativo.
- Remover métricas supérfluas (ex: contagem de pontos do caminho).

## Layout de campos

- Campos lado a lado (`.field-row`): alinhar inputs pelo bottom com `align-items: flex-end` no container pai. Não forçar altura fixa nos labels.
- Grade quadriculada ao fundo geometricamente correta (específica deste projeto, não extrapolar).
- Manter os três ícones de formato (redonda, quadrada, cobrinha) com padding confortável.
- Réguas: largura horizontal acima da mesa tracejada e profundidade vertical ao lado, com ticks alinhados.

## Fluxo de visualização

- A prévia 2D e 3D ocupam o mesmo espaço. O 3D substitui o 2D; oferecer caminho claro para voltar.
- Ação primária: "Pré-visualizar" (gera o 3D), depois "Exportar STL".
- Botões Voltar/Exportar ficam na área de ações do formulário, não no cabeçalho da prévia.
- Se qualquer input mudar durante a prévia 3D, retornar automaticamente ao 2D.
- Controles de parâmetro permanecem visíveis enquanto o 3D renderiza como inset contido sobre o viewport.
- Tela inicial deve parecer completa sem corte, com escala compacta mas legível.

## Acessibilidade

- Controles visíveis: alternância claro/escuro, toggle de alto contraste, A+/A− para tamanho de fonte.
- Faixa de tamanho de fonte: **12px–24px** (mínimo 12, máximo 24).
- Valor salvo em `localStorage` validado dentro da faixa permitida.
- Checar foco por teclado, contraste e ausência de scroll horizontal.

## Git

Sempre fazer commit e push após alterações. Para mudanças simples, commit e push direto sem perguntar. Se houver algo que possa ser sensível ou privado (chaves, credenciais, dados pessoais), perguntar antes de fazer o push.

## Validação

Usar `npm test` e `npm run build`. Verificar responsividade em 320, 768 e 1440 px.

## Preferências gerais (Obsidian)

Consultar antes de edições de UI:

- `Skills/frontend/minhas-preferencias.md` — checklist de front-end e processo de decisão visual.
- `ClaudeBrain/Memoria/preferencias-design-anti-ai-slop.md` — design anti-AI-slop, direção visual e feedback concreto.
- `ClaudeBrain/Memoria/preferencias-layout-acessibilidade.md` — alinhamento de inputs e limites de fonte.
- `ClaudeBrain/Memoria/convencao-commits.md` — Conventional Commits.
- Responsividade obrigatória em todos os apps/sites.
- Cantos arredondados com propósito, nunca arbitrários.
- Texto enxuto; sem conteúdo inventado.
- Para projetos novos, criar `testes-front/` com opções HTML por eixo de decisão e aguardar aprovação.

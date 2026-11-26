# Gerador paramétrico para impressão 3D

Aplicação web para configurar trajetórias de filamento em formatos redondo, quadrado ou serpentina, pré-visualizar o caminho em 2D e o modelo em 3D, e exportar o modelo como STL.

## Requisitos

- Node.js 20.19+ ou 22.12+
- npm

## Executar localmente

```sh
npm install
npm run dev
```

Abra o endereço local informado pelo Vite (por padrão `http://127.0.0.1:5173`).

## Testar e compilar

```sh
npm test
npm run build
npm run preview
```

## Uso

1. Escolha o formato e configure comprimento, dimensões úteis da mesa e parâmetros da trajetória.
2. Selecione **Pré-visualizar** para ver o modelo em 3D no mesmo espaço da prévia 2D.
3. Use **Voltar aos parâmetros** para editar a configuração; a prévia 2D reaparece.
4. Selecione **Exportar STL** para salvar o modelo.

Comprimento é informado e apresentado em metros. Dimensões físicas da mesa e espaçamentos são em milímetros. O diâmetro do filamento é fixo em 1,75 mm. O STL usa coordenadas em milímetros, como esperado pela maioria dos fatiadores.

## Acessibilidade

A interface oferece alternância de tema claro/escuro, alto contraste ativável e controles para ajustar o tamanho do texto. As preferências ficam armazenadas localmente no navegador. A mesa usa réguas de largura e profundidade na prévia. A área 3D fica contida dentro do mesmo espaço da prévia, mantendo os parâmetros visíveis.

## Tecnologias

Vite, JavaScript, CSS e Three.js.

## Créditos

Desenvolvido por Samuel de Sá.

- Email: [samueldsa03032005@gmail.com](mailto:samueldsa03032005@gmail.com)
- GitHub: [@samueldesaa](https://github.com/samueldesaa)
- Instagram: [@samueldesaa](https://instagram.com/samueldesaa)

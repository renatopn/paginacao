function processar() {
    // Obter valores dos campos de entrada
    const comprimentoArea = parseFloat(document.getElementById('comprimentoArea').value.replace(',', '.'));
    const larguraArea = parseFloat(document.getElementById('larguraArea').value.replace(',', '.'));
    const comprimentoRevestimento = parseFloat(document.getElementById('comprimentoRevestimento').value.replace(',', '.'));
    const larguraRevestimento = parseFloat(document.getElementById('larguraRevestimento').value.replace(',', '.'));
    const inverterSentido = document.getElementById('inverterSentido').checked;

    // Validar entradas
    if (isNaN(comprimentoArea) || isNaN(larguraArea) || isNaN(comprimentoRevestimento) || isNaN(larguraRevestimento) ||
        comprimentoArea <= 0 || larguraArea <= 0 || comprimentoRevestimento <= 0 || larguraRevestimento <= 0) {
        alert("Por favor, insira valores numéricos válidos maiores que zero.");
        return;
    }

    // Calcular índice de conversão
    const maiorDimensaoArea = Math.max(comprimentoArea, larguraArea);
    const indiceConversao = 800 / maiorDimensaoArea;

    // Definir dimensões em pixels da área coberta
    const larguraPixel = 800;
    const alturaPixel = (comprimentoArea > larguraArea ? larguraArea : comprimentoArea) * indiceConversao;

    // Desenhar área coberta
    const areaCoberta = document.getElementById('areaCoberta');
    areaCoberta.style.width = `${larguraPixel}px`;
    areaCoberta.style.height = `${alturaPixel}px`;
    areaCoberta.innerHTML = '';

    // Definir dimensões em pixels do revestimento
    let comprimentoRevestimentoPixel = comprimentoRevestimento * indiceConversao;
    let larguraRevestimentoPixel = larguraRevestimento * indiceConversao;

    // Definir base e altura do revestimento
    let baseRevestimento = Math.max(comprimentoRevestimentoPixel, larguraRevestimentoPixel);
    let alturaRevestimento = Math.min(comprimentoRevestimentoPixel, larguraRevestimentoPixel);

    // Inverter dimensões do revestimento se necessário
    if (inverterSentido) {
        [baseRevestimento, alturaRevestimento] = [alturaRevestimento, baseRevestimento];
    }

    // Iniciar posicionamento dos revestimentos
    let x = 0, y = 0;
    let countRevestimento = 0;
    const legendas = {};
    const sobras = {};

    // Inicializar a sobra de revestimento
    let sobraRevestimento = {
        largura: baseRevestimento,
        altura: alturaRevestimento
    };

    let countRevestimentoFrac = 0;

    while (y < alturaPixel) {
        while (x < larguraPixel) {
            const restoX = larguraPixel - x;
            const restoY = alturaPixel - y;

            if (restoX >= baseRevestimento && restoY >= alturaRevestimento) {
                // Adicionar revestimento completo
                const revestimento = document.createElement('div');
                revestimento.style.position = 'absolute';
                revestimento.style.left = `${x}px`;
                revestimento.style.top = `${y}px`;
                revestimento.style.width = `${baseRevestimento}px`;
                revestimento.style.height = `${alturaRevestimento}px`;
                revestimento.style.backgroundColor = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.85)`;
                areaCoberta.appendChild(revestimento);

                x += baseRevestimento;
                countRevestimento++;
            } else if (restoX > 0 && restoY > 0) {
                // Adicionar revestimento de corte
                const corteWidth = Math.min(restoX, baseRevestimento);
                const corteHeight = Math.min(restoY, alturaRevestimento);

                const corte = document.createElement('div');
                corte.style.position = 'absolute';
                corte.style.left = `${x}px`;
                corte.style.top = `${y}px`;
                corte.style.width = `${corteWidth}px`;
                corte.style.height = `${corteHeight}px`;
                corte.style.backgroundColor = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.85)`;
                areaCoberta.appendChild(corte);

                x += corteWidth;

                // Adicionar à legenda
                const key = `${(corteWidth / indiceConversao).toFixed(2)}x${(corteHeight / indiceConversao).toFixed(2)}`;
                if (legendas[key]) {
                    legendas[key].count++;
                } else {
                    legendas[key] = {
                        count: 1,
                        color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.85)`
                    };
                }

                  // Atualizar a sobra de revestimento
                  if (sobraRevestimento.largura >= corteWidth && sobraRevestimento.altura >= corteHeight) {
                    if(corteWidth<baseRevestimento){
                        sobraRevestimento.largura -= corteWidth;
                    }
                        
                    if(corteHeight<alturaRevestimento){
                        sobraRevestimento.altura -= corteHeight;
                    }
                        

                    // Registrar a sobra
                    if (sobraRevestimento.largura < corteWidth || sobraRevestimento.altura < corteHeight) {
                        const key = `${(sobraRevestimento.largura / indiceConversao).toFixed(2)}x${(sobraRevestimento.altura / indiceConversao).toFixed(2)}`;
                        if (sobras[key]) {
                            sobras[key]++;
                        } else {
                            sobras[key] = 1;
                        }
                        countRevestimentoFrac ++;
                        sobraRevestimento.largura = baseRevestimento;
                        sobraRevestimento.altura = alturaRevestimento;
                        
                    }
                }

            } else {
                x = larguraPixel;
            }
        }
        x = 0;
        y += alturaRevestimento;
    }

    // Atualizar legenda
    const legenda = document.getElementById('legenda');
    legenda.innerHTML = '';

    // Adicionar "Revestimento Completo" à legenda
    const revestimentoCompletoItem = document.createElement('div');
    revestimentoCompletoItem.className = 'legenda-item';
    revestimentoCompletoItem.innerHTML = `
        <div class="legenda-cor" style="background-color: rgba(0,0,0,0.85);"></div>
        <span>Revestimento Completo: ${countRevestimento} vezes</span> 
         <div class="legenda-cor" style="background-color: rgba(255,255,255,0.85);"></div>
         <span> Revestimento Fracionado: ${countRevestimentoFrac} peças usadas</span><br>
    `;
    revestimentoCompletoItem.addEventListener('click', () => openColorModal('Revestimento Completo', 'rgba(0,0,0,0.85)'));
    legenda.appendChild(revestimentoCompletoItem);

    // Adicionar cortes à legenda
    for (const [dimensoes, info] of Object.entries(legendas)) {
        const legendaItem = document.createElement('div');
        legendaItem.className = 'legenda-item';
        legendaItem.innerHTML = `
            <div class="legenda-cor" style="background-color: ${info.color};"></div>
            <span>${dimensoes} m: ${info.count} vezes</span>
        `;
        legendaItem.addEventListener('click', () => openColorModal(dimensoes, info.color));
        legenda.appendChild(legendaItem);
    }

    // Adicionar sobras à legenda
    for (const [dimensoes, count] of Object.entries(sobras)) {
        const sobraItem = document.createElement('div');
        sobraItem.className = 'legenda-item';
        sobraItem.innerHTML = `
            <div class="legenda-cor" style="background-color: rgba(128,128,128,0.85);"></div>
            <span>Sobra de Revestimento ${dimensoes} m: ${count} vezes</span>
        `;
        legenda.appendChild(sobraItem);
    }
}

function openColorModal(dimensoes, currentColor) {
    selectedLegendItem = dimensoes;
    selectedColor = currentColor;

    const modal = document.getElementById('colorModal');
    const selectedColorPreview = document.getElementById('selectedColorPreview');
    selectedColorPreview.style.backgroundColor = currentColor;

    const colorPalette = document.getElementById('colorPalette');
    colorPalette.innerHTML = '';

    // Gerar paleta de cores
    const colors = generateColorPalette();
    colors.forEach(color => {
        const colorBox = document.createElement('div');
        colorBox.className = 'color-box';
        colorBox.style.backgroundColor = color;
        colorBox.addEventListener('click', () => {
            selectedColor = color;
            selectedColorPreview.style.backgroundColor = color;
        });
        colorPalette.appendChild(colorBox);
    });

    modal.style.display = 'block';
}

function closeColorModal() {
    const modal = document.getElementById('colorModal');
    modal.style.display = 'none';
}

function generateColorPalette() {
    const colors = [];
    for (let r = 0; r < 256; r += 64) {
        for (let g = 0; g < 256; g += 64) {
            for (let b = 0; b < 256; b += 64) {
                colors.push(`rgb(${r}, ${g}, ${b})`);
            }
        }
    }
    return colors;
}

document.getElementById('confirmColor').addEventListener('click', () => {
    const legendaItems = document.querySelectorAll('.legenda-item');
    legendaItems.forEach(item => {
        if (item.textContent.includes(selectedLegendItem)) {
            const colorBox = item.querySelector('.legenda-cor');
            colorBox.style.backgroundColor = selectedColor;
        }
    });

    const revestimentos = document.querySelectorAll('#areaCoberta > div');
    revestimentos.forEach(revestimento => {
        const width = revestimento.style.width;
        const height = revestimento.style.height;

        // Calcular as dimensões em metros
        const comprimentoArea = parseFloat(document.getElementById('comprimentoArea').value.replace(',', '.'));
        const larguraArea = parseFloat(document.getElementById('larguraArea').value.replace(',', '.'));
        const maiorDimensaoArea = Math.max(comprimentoArea, larguraArea);
        const indiceConversao = 800 / maiorDimensaoArea;

        const widthMetros = (parseFloat(width) / indiceConversao).toFixed(2);
        const heightMetros = (parseFloat(height) / indiceConversao).toFixed(2);
        const dimensoes = `${widthMetros}x${heightMetros}`;

        // Verificar se as dimensões correspondem ao item selecionado
        if (dimensoes === selectedLegendItem || selectedLegendItem === 'Revestimento Completo') {
            revestimento.style.backgroundColor = selectedColor;
        }
    });

    closeColorModal();
});

document.getElementById('cancelColor').addEventListener('click', closeColorModal);

document.querySelector('.close').addEventListener('click', closeColorModal);

window.addEventListener('click', (event) => {
    const modal = document.getElementById('colorModal');
    if (event.target === modal) {
        closeColorModal();
    }
});